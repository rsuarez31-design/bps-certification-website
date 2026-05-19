import { supabaseAdmin } from '@/lib/supabase-server';
import { sendEmailWithEvent } from '@/lib/email-service';
import { buildWelcomeEmail } from '@/lib/email-templates';

type RegistrationEmailRow = {
  id: string;
  full_name: string | null;
  last_name: string | null;
  email: string | null;
  payment_status: string | null;
};

function isPaid(status: string | null | undefined): boolean {
  return String(status || '').trim().toLowerCase() === 'paid';
}

export async function sendWelcomeEmailForRegistration(registrationId: string) {
  if (!registrationId) {
    return { ok: false, reason: 'registration_id_empty' };
  }

  const { data, error } = await supabaseAdmin
    .from('registrations')
    .select('id, full_name, last_name, email, payment_status')
    .eq('id', registrationId)
    .maybeSingle();

  if (error || !data) {
    console.error('welcome email: no se pudo cargar la matrícula', error);
    return { ok: false, reason: 'registration_not_found' };
  }

  const registration = data as RegistrationEmailRow;
  if (!isPaid(registration.payment_status)) {
    return { ok: false, reason: 'registration_not_paid' };
  }

  const recipient = (registration.email || '').trim().toLowerCase();
  if (!recipient) {
    return { ok: false, reason: 'registration_email_empty' };
  }

  const email = buildWelcomeEmail({
    fullName: registration.full_name || '',
    lastName: registration.last_name || '',
  });

  return sendEmailWithEvent({
    eventKey: `welcome:${registration.id}`,
    type: 'welcome',
    recipient,
    registrationId: registration.id,
    subject: email.subject,
    html: email.html,
    text: email.text,
  });
}
