import { supabaseAdmin } from '@/lib/supabase-server';
import { getOrCreateCertificatePdfBytes } from '@/lib/certificate-storage';
import { sendEmailWithEvent } from '@/lib/email-service';
import { buildCertificateEmail } from '@/lib/email-templates';

type AttemptEmailRow = {
  id: string;
  passed: boolean | null;
  exam_type: string | null;
  registration_id: string | null;
  student_email: string | null;
};

type RegistrationNameRow = {
  full_name: string | null;
  last_name: string | null;
};

export async function sendCertificateEmailForAttempt(attemptId: string) {
  if (!attemptId) {
    return { ok: false, reason: 'attempt_id_empty' };
  }

  const { data: attemptData, error: attemptError } = await supabaseAdmin
    .from('exam_attempts')
    .select('id, passed, exam_type, registration_id, student_email')
    .eq('id', attemptId)
    .maybeSingle();

  if (attemptError || !attemptData) {
    console.error('certificate email: no se pudo cargar el intento', attemptError);
    return { ok: false, reason: 'attempt_not_found' };
  }

  const attempt = attemptData as AttemptEmailRow;
  if (attempt.exam_type !== 'oficial' || !attempt.passed) {
    return { ok: false, reason: 'attempt_not_eligible' };
  }
  if (!attempt.registration_id) {
    return { ok: false, reason: 'registration_id_empty' };
  }

  const recipient = (attempt.student_email || '').trim().toLowerCase();
  if (!recipient) {
    return { ok: false, reason: 'attempt_email_empty' };
  }

  const { data: registrationData, error: registrationError } = await supabaseAdmin
    .from('registrations')
    .select('full_name, last_name')
    .eq('id', attempt.registration_id)
    .maybeSingle();

  if (registrationError || !registrationData) {
    console.error('certificate email: no se pudo cargar la matrícula', registrationError);
    return { ok: false, reason: 'registration_not_found' };
  }

  const certificate = await getOrCreateCertificatePdfBytes({
    attemptId: attempt.id,
    verifyStudentEmail: recipient,
  });

  if ('error' in certificate) {
    console.error('certificate email: no se pudo preparar el certificado', certificate.error);
    return { ok: false, reason: 'certificate_unavailable', error: certificate.error };
  }

  const registration = registrationData as RegistrationNameRow;
  const email = buildCertificateEmail({
    fullName: registration.full_name || '',
    lastName: registration.last_name || '',
  });

  return sendEmailWithEvent({
    eventKey: `certificate:${attempt.id}`,
    type: 'certificate',
    recipient,
    registrationId: attempt.registration_id,
    attemptId: attempt.id,
    subject: email.subject,
    html: email.html,
    text: email.text,
    attachments: [
      {
        filename: 'certificado-oficial-bps.pdf',
        content: Buffer.from(certificate.pdfBytes).toString('base64'),
        contentType: 'application/pdf',
      },
    ],
  });
}
