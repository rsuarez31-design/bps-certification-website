/**
 * GET /api/admin/exam-attempts
 * Listado de intentos del examen oficial con datos de matrícula (join server-side).
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { hasValidAdminSession } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

type RegistrationJoin = {
  full_name: string | null;
  last_name: string | null;
  course_month: string | null;
  course_year: string | null;
};

function normalizeRegistrationJoin(
  raw: RegistrationJoin | RegistrationJoin[] | null | undefined,
): RegistrationJoin | null {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw[0] ?? null;
  return raw;
}

export async function GET(request: NextRequest) {
  try {
    if (!hasValidAdminSession(request)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('exam_attempts')
      .select(`
        id,
        created_at,
        registration_id,
        student_name,
        student_email,
        correct_answers,
        incorrect_answers,
        unanswered,
        percentage,
        passed,
        exam_type,
        total_questions,
        certificate_pdf_path,
        certificate_id,
        certificate_issued_at,
        registrations (
          full_name,
          last_name,
          course_month,
          course_year
        )
      `)
      .eq('exam_type', 'oficial')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const attempts = (data || []).map((row) => {
      const reg = normalizeRegistrationJoin(
        (row as { registrations?: RegistrationJoin | RegistrationJoin[] | null }).registrations,
      );
      const fullName = (reg?.full_name || '').trim();
      const lastName = (reg?.last_name || '').trim();

      return {
        id: row.id as string,
        created_at: row.created_at as string,
        registration_id: row.registration_id as string | null,
        student_name: row.student_name as string,
        student_email: row.student_email as string,
        correct_answers: row.correct_answers as number,
        incorrect_answers: row.incorrect_answers as number,
        unanswered: row.unanswered as number,
        percentage: row.percentage as number,
        passed: row.passed as boolean,
        exam_type: row.exam_type as string,
        total_questions: row.total_questions as number,
        certificate_pdf_path: row.certificate_pdf_path as string | null,
        certificate_id: row.certificate_id as string | null,
        certificate_issued_at: row.certificate_issued_at as string | null,
        full_name: fullName || (row.student_name as string) || '',
        last_name: lastName,
        course_month: (reg?.course_month || '').trim(),
        course_year: (reg?.course_year || '').trim(),
      };
    });

    return NextResponse.json(
      { attempts },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      },
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
