/**
 * POST /api/exam/submit
 * Calcula y registra el resultado del examen oficial en servidor (para integridad del certificado).
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { validateOfficialExamAccess } from '@/lib/exam-official-access';
import { sendCertificateEmailForAttempt } from '@/lib/certificate-email-events';

export const dynamic = 'force-dynamic';

const OFFICIAL_TOTAL = 75;
const PASS_PCT = 80;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || '');
    const registrationId = String(body.registrationId || '');
    const totalQuestions = Number(body.totalQuestions || 0);
    const questionIdsRaw = body.questionIds as unknown;
    const answersRaw = body.answers as Record<string, number> | undefined;

    if (!registrationId) {
      return NextResponse.json({ error: 'registrationId requerido' }, { status: 400 });
    }
    if (totalQuestions !== OFFICIAL_TOTAL) {
      return NextResponse.json({ error: 'El examen oficial debe tener 75 preguntas.' }, { status: 400 });
    }
    if (!Array.isArray(questionIdsRaw) || questionIdsRaw.length !== OFFICIAL_TOTAL) {
      return NextResponse.json({ error: 'questionIds debe incluir 75 IDs.' }, { status: 400 });
    }
    if (!answersRaw || typeof answersRaw !== 'object') {
      return NextResponse.json({ error: 'answers requerido' }, { status: 400 });
    }

    const questionIds = questionIdsRaw.map((id) => Number(id));
    if (questionIds.some((id) => !Number.isFinite(id))) {
      return NextResponse.json({ error: 'questionIds inválidos.' }, { status: 400 });
    }
    const uniq = new Set(questionIds);
    if (uniq.size !== OFFICIAL_TOTAL) {
      return NextResponse.json({ error: 'questionIds duplicados o incompletos.' }, { status: 400 });
    }

    const access = await validateOfficialExamAccess(email);
    if (!access.ok) {
      return NextResponse.json({ error: access.reason }, { status: 403 });
    }
    if (access.registration.id !== registrationId) {
      return NextResponse.json({ error: 'La matrícula no coincide con el email.' }, { status: 403 });
    }

    const { data: rows, error: qErr } = await supabaseAdmin
      .from('exam_questions')
      .select('id, correct_index')
      .in('id', questionIds);

    if (qErr || !rows || rows.length !== OFFICIAL_TOTAL) {
      return NextResponse.json({ error: 'No se pudieron validar las preguntas contra el banco.' }, { status: 500 });
    }

    const correctMap = new Map<number, number>();
    (rows as { id: number; correct_index: number }[]).forEach((r) =>
      correctMap.set(r.id, r.correct_index),
    );

    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;

    const answerRows: {
      question_id: number;
      selected_index: number;
      is_correct: boolean;
    }[] = [];

    for (const qid of questionIds) {
      const rawSel = answersRaw[String(qid)] ?? answersRaw[qid as unknown as string];
      if (rawSel === undefined || rawSel === null) {
        unanswered++;
        continue;
      }
      const idx = Number(rawSel);
      if (!Number.isFinite(idx) || idx < 0 || idx > 3) {
        return NextResponse.json({ error: 'Índice de respuesta inválido.' }, { status: 400 });
      }
      const okIdx = correctMap.get(qid);
      if (okIdx === undefined) {
        return NextResponse.json({ error: 'Pregunta no encontrada en el banco.' }, { status: 400 });
      }
      const isCorrect = idx === okIdx;
      if (isCorrect) correct++;
      else incorrect++;
      answerRows.push({
        question_id: qid,
        selected_index: idx,
        is_correct: isCorrect,
      });
    }

    const percentage = Math.round((correct / OFFICIAL_TOTAL) * 100);
    const passed = percentage >= PASS_PCT;

    const studentName =
      `${access.registration.full_name || ''} ${access.registration.last_name || ''}`.trim() ||
      access.registration.email;

    const completedAt = new Date().toISOString();

    const { data: inserted, error: insErr } = await supabaseAdmin
      .from('exam_attempts')
      .insert({
        student_name: studentName,
        student_email: email.trim().toLowerCase(),
        registration_id: registrationId,
        exam_type: 'oficial',
        total_questions: OFFICIAL_TOTAL,
        correct_answers: correct,
        incorrect_answers: incorrect,
        unanswered,
        percentage,
        passed,
        completed_at: completedAt,
      })
      .select('id')
      .single();

    if (insErr || !inserted?.id) {
      return NextResponse.json({ error: insErr?.message || 'No se pudo guardar el intento.' }, { status: 500 });
    }

    const attemptId = inserted.id as string;

    if (answerRows.length > 0) {
      const { error: ansErr } = await supabaseAdmin.from('exam_attempt_answers').insert(
        answerRows.map((a) => ({
          attempt_id: attemptId,
          question_id: a.question_id,
          selected_index: a.selected_index,
          is_correct: a.is_correct,
        })),
      );
      if (ansErr) {
        return NextResponse.json({ error: ansErr.message || 'No se pudieron guardar las respuestas.' }, { status: 500 });
      }
    }

    if (passed) {
      try {
        await sendCertificateEmailForAttempt(attemptId);
      } catch (emailError) {
        console.error('No se pudo enviar el email de certificado:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      attemptId,
      correct,
      incorrect,
      unanswered,
      percentage,
      passed,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
