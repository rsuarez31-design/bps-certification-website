/**
 * Validaciones server-side para tomar el examen oficial (matrícula pagada, ventana 24h, intentos).
 */

import { supabaseAdmin } from '@/lib/supabase-server';

export type PaidRegistrationRow = {
  id: string;
  created_at: string;
  email: string;
  full_name: string;
  last_name: string;
  payment_status: string;
};

export async function validateOfficialExamAccess(emailRaw: string): Promise<
  | { ok: true; registration: PaidRegistrationRow; attemptsUsed: number }
  | { ok: false; reason: string }
> {
  const email = emailRaw.trim().toLowerCase();
  if (!email) {
    return { ok: false, reason: 'Se requiere un email válido.' };
  }

  const { data: registration, error: regError } = await supabaseAdmin
    .from('registrations')
    .select('id, created_at, email, full_name, last_name, payment_status')
    .eq('email', email)
    .in('payment_status', ['paid', 'Paid'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (regError || !registration) {
    return { ok: false, reason: 'No se encontró una matrícula pagada con este email.' };
  }

  const matriculaDate = new Date(registration.created_at);
  const ahora = new Date();
  const horasTranscurridas = (ahora.getTime() - matriculaDate.getTime()) / (1000 * 60 * 60);
  if (horasTranscurridas > 24) {
    return {
      ok: false,
      reason: 'Tu periodo de 24 horas para tomar el examen ha expirado. Contacta al administrador.',
    };
  }

  const hace24h = new Date(ahora.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await supabaseAdmin
    .from('exam_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('student_email', email)
    .eq('exam_type', 'oficial')
    .gte('created_at', hace24h);

  if (countError) {
    return { ok: false, reason: 'No se pudo verificar intentos previos.' };
  }

  const intentosUsados = count ?? 0;
  if (intentosUsados >= 3) {
    return { ok: false, reason: 'Has alcanzado el máximo de 3 intentos permitidos.' };
  }

  return {
    ok: true,
    registration: registration as PaidRegistrationRow,
    attemptsUsed: intentosUsados,
  };
}
