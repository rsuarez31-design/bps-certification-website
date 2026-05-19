/**
 * Emisión y almacenamiento del certificado PDF oficial en Supabase Storage.
 */

import { supabaseAdmin } from '@/lib/supabase-server';
import { generateOfficialCertificatePdfBytes } from '@/lib/certificate-pdf';

const BUCKET = 'certificates';
const SIGNED_TTL = 3600;

function formatExamDatePuertoRico(iso: string | null | undefined): string {
  if (!iso) return '--/--/----';
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'America/Puerto_Rico',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return '--/--/----';
  }
}

async function signedUrlForPath(storagePath: string): Promise<string | null> {
  const { data: signedData, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, SIGNED_TTL);
  if (error || !signedData?.signedUrl) return null;
  return signedData.signedUrl;
}

export async function getOrCreateCertificateSignedUrl(opts: {
  attemptId: string;
  /** Si se pasa, debe coincidir con exam_attempts.student_email */
  verifyStudentEmail?: string;
}): Promise<{ signedUrl: string; storagePath: string } | { error: string; status: number }> {
  const { data: attempt, error: aErr } = await supabaseAdmin
    .from('exam_attempts')
    .select(
      'id, passed, exam_type, completed_at, registration_id, student_email, certificate_pdf_path',
    )
    .eq('id', opts.attemptId)
    .maybeSingle();

  if (aErr || !attempt) {
    return { error: 'Intento no encontrado.', status: 404 };
  }

  if (attempt.exam_type !== 'oficial') {
    return { error: 'Solo el examen oficial tiene certificado.', status: 400 };
  }
  if (!attempt.passed) {
    return { error: 'El intento no está aprobado.', status: 400 };
  }
  if (!attempt.registration_id || !attempt.completed_at) {
    return { error: 'Datos incompletos para emitir certificado.', status: 400 };
  }

  if (opts.verifyStudentEmail) {
    const want = opts.verifyStudentEmail.trim().toLowerCase();
    const got = (attempt.student_email || '').trim().toLowerCase();
    if (!want || got !== want) {
      return { error: 'No autorizado para este certificado.', status: 403 };
    }
  }

  const { data: reg, error: rErr } = await supabaseAdmin
    .from('registrations')
    .select('full_name, last_name, email')
    .eq('id', attempt.registration_id)
    .maybeSingle();

  if (rErr || !reg) {
    return { error: 'No se encontró la matrícula asociada.', status: 400 };
  }

  let storagePath = (attempt.certificate_pdf_path as string | null) || '';

  if (!storagePath) {
    const recipientLine = `${reg.full_name || ''} ${reg.last_name || ''}`.trim();
    if (!recipientLine) {
      return { error: 'La matrícula no tiene nombre completo.', status: 400 };
    }
    const dateLabel = formatExamDatePuertoRico(attempt.completed_at as string);
    const pdfBytes = await generateOfficialCertificatePdfBytes({
      recipientLine,
      examDateDdMmYyyy: dateLabel,
    });

    storagePath = `official/${attempt.registration_id}/${attempt.id}.pdf`;

    const { error: upErr } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(storagePath, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (upErr) {
      return { error: upErr.message || 'No se pudo subir el certificado.', status: 500 };
    }

    const { error: updErr } = await supabaseAdmin
      .from('exam_attempts')
      .update({
        certificate_pdf_path: storagePath,
        certificate_id: attempt.id,
        certificate_issued_at: new Date().toISOString(),
      })
      .eq('id', attempt.id);

    if (updErr) {
      return { error: updErr.message || 'No se pudo registrar el certificado.', status: 500 };
    }
  }

  const signedUrl = await signedUrlForPath(storagePath);
  if (!signedUrl) {
    return { error: 'No se pudo generar el enlace del certificado.', status: 500 };
  }

  return { signedUrl, storagePath };
}

export async function getOrCreateCertificatePdfBytes(opts: {
  attemptId: string;
  /** Si se pasa, debe coincidir con exam_attempts.student_email */
  verifyStudentEmail?: string;
}): Promise<{ pdfBytes: Uint8Array; storagePath: string } | { error: string; status: number }> {
  const result = await getOrCreateCertificateSignedUrl(opts);
  if ('error' in result) {
    return result;
  }

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .download(result.storagePath);

  if (error || !data) {
    return { error: error?.message || 'No se pudo descargar el certificado.', status: 500 };
  }

  const arrayBuffer = await data.arrayBuffer();
  return {
    pdfBytes: new Uint8Array(arrayBuffer),
    storagePath: result.storagePath,
  };
}
