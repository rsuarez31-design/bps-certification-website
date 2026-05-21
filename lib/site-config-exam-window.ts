/**
 * Ventana de disponibilidad del examen oficial (zona America/Puerto_Rico).
 */

export const PR_TIMEZONE = 'America/Puerto_Rico';
/** Puerto Rico usa AST (UTC−4) todo el año; no observa DST. */
export const PR_UTC_OFFSET = '-04:00';

const DATETIME_LOCAL_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export function isOfficialExamPubliclyVisible(
  startAt: string | Date | null | undefined,
  endAt: string | Date | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!startAt || !endAt) return false;
  const start = startAt instanceof Date ? startAt : new Date(startAt);
  const end = endAt instanceof Date ? endAt : new Date(endAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false;
  const t = now.getTime();
  return t >= start.getTime() && t <= end.getTime();
}

export function parseDateTimeLocalAsPuertoRico(value: string): Date | null {
  const v = value.trim();
  if (!v) return null;
  if (DATETIME_LOCAL_RE.test(v)) {
    const d = new Date(`${v}:00${PR_UTC_OFFSET}`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDateTimeLocalForPuertoRico(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: PR_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    hourCycle: 'h23',
  }).formatToParts(d);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

export function validateExamWindowInput(
  startInput: string | null | undefined,
  endInput: string | null | undefined,
): { ok: true; startAt: Date | null; endAt: Date | null } | { ok: false; error: string } {
  const startStr = (startInput ?? '').trim();
  const endStr = (endInput ?? '').trim();

  if (!startStr && !endStr) {
    return { ok: true, startAt: null, endAt: null };
  }
  if (!startStr || !endStr) {
    return {
      ok: false,
      error: 'Debe indicar fecha/hora de inicio y fin del examen, o dejar ambas vacías.',
    };
  }

  const startAt = parseDateTimeLocalAsPuertoRico(startStr);
  const endAt = parseDateTimeLocalAsPuertoRico(endStr);
  if (!startAt || !endAt) {
    return { ok: false, error: 'Formato de fecha/hora inválido.' };
  }
  if (startAt.getTime() >= endAt.getTime()) {
    return { ok: false, error: 'La fecha/hora de inicio debe ser anterior a la de fin.' };
  }

  return { ok: true, startAt, endAt };
}

export type ExamWindowStatus = 'unconfigured' | 'active' | 'outside';

export function getExamWindowStatus(
  startAt: string | null | undefined,
  endAt: string | null | undefined,
  now: Date = new Date(),
): ExamWindowStatus {
  if (!startAt || !endAt) return 'unconfigured';
  return isOfficialExamPubliclyVisible(startAt, endAt, now) ? 'active' : 'outside';
}
