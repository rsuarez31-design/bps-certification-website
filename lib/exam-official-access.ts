/**
 * Validaciones server-side para tomar el examen oficial:
 * ventana global, curso corriente, nombre/apellido/email, intentos por ventana.
 */

import { supabaseAdmin } from '@/lib/supabase-server';
import { isOfficialExamPubliclyVisible } from '@/lib/site-config-exam-window';

export type PaidRegistrationRow = {
  id: string;
  created_at: string;
  email: string;
  full_name: string;
  last_name: string;
  payment_status: string;
  course_month: string;
  course_year: string;
  course_name: string;
};

export type ValidateOfficialExamAccessInput = {
  email: string;
  firstName: string;
  lastName: string;
};

export function normalizePersonName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ');
}

function resolveRegistrationCourseSection(reg: {
  course_month?: string | null;
  course_year?: string | null;
  course_name?: string | null;
}): { month: string; year: string } {
  let month = String(reg.course_month ?? '').trim();
  let year = String(reg.course_year ?? '').trim();

  if ((!month || !year) && reg.course_name) {
    const parts = String(reg.course_name).split(' - ').map((p) => p.trim());
    if (parts.length >= 3) {
      const maybeMonth = parts[parts.length - 2];
      const maybeYear = parts[parts.length - 1];
      const validMonths = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
      ];
      if (validMonths.includes(maybeMonth) && /^\d{4}$/.test(maybeYear)) {
        month = month || maybeMonth;
        year = year || maybeYear;
      }
    }
  }

  return { month, year };
}

function courseSectionMatches(
  regMonth: string,
  regYear: string,
  configMonth: string,
  configYear: string,
): boolean {
  return (
    normalizePersonName(regMonth) === normalizePersonName(configMonth) &&
    String(regYear).trim() === String(configYear).trim()
  );
}

export async function validateOfficialExamAccess(
  input: ValidateOfficialExamAccessInput,
): Promise<
  | { ok: true; registration: PaidRegistrationRow; attemptsUsed: number }
  | { ok: false; reason: string }
> {
  const email = input.email.trim().toLowerCase();
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();

  if (!email) {
    return { ok: false, reason: 'Se requiere un email válido.' };
  }
  if (!firstName) {
    return { ok: false, reason: 'Por favor ingresa tu nombre.' };
  }
  if (!lastName) {
    return { ok: false, reason: 'Por favor ingresa tu apellido.' };
  }

  const { data: siteConfig, error: configError } = await supabaseAdmin
    .from('site_config')
    .select('course_month, course_year, official_exam_start_at, official_exam_end_at')
    .eq('id', 'default')
    .maybeSingle();

  if (configError || !siteConfig) {
    return { ok: false, reason: 'El examen oficial no está disponible en este momento.' };
  }

  const startAt = siteConfig.official_exam_start_at as string | null;
  const endAt = siteConfig.official_exam_end_at as string | null;

  if (!isOfficialExamPubliclyVisible(startAt, endAt)) {
    return { ok: false, reason: 'El examen oficial no está disponible en este momento.' };
  }

  const configMonth = String(siteConfig.course_month ?? '').trim();
  const configYear = String(siteConfig.course_year ?? '').trim();

  const { data: registration, error: regError } = await supabaseAdmin
    .from('registrations')
    .select(
      'id, created_at, email, full_name, last_name, payment_status, course_month, course_year, course_name',
    )
    .eq('email', email)
    .in('payment_status', ['paid', 'Paid'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (regError || !registration) {
    return { ok: false, reason: 'No se encontró una matrícula pagada con este email.' };
  }

  const regSection = resolveRegistrationCourseSection(registration);
  if (!regSection.month || !regSection.year) {
    return {
      ok: false,
      reason: 'Tu matrícula no tiene sección de curso registrada. Contacta al administrador.',
    };
  }

  if (!courseSectionMatches(regSection.month, regSection.year, configMonth, configYear)) {
    return {
      ok: false,
      reason: `Tu matrícula no corresponde al curso actual (${configMonth} ${configYear}).`,
    };
  }

  if (normalizePersonName(firstName) !== normalizePersonName(String(registration.full_name ?? ''))) {
    return { ok: false, reason: 'El nombre no coincide con la matrícula registrada.' };
  }

  if (normalizePersonName(lastName) !== normalizePersonName(String(registration.last_name ?? ''))) {
    return { ok: false, reason: 'El apellido no coincide con la matrícula registrada.' };
  }

  const { count, error: countError } = await supabaseAdmin
    .from('exam_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('student_email', email)
    .eq('exam_type', 'oficial')
    .gte('created_at', startAt!)
    .lte('created_at', endAt!);

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
