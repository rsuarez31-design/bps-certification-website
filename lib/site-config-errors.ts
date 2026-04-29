/**
 * Detecta errores de PostgREST / Postgres por columnas de visibilidad ausentes (migración v7).
 */

export function isMissingSiteConfigVisibilityColumnsError(err: unknown): boolean {
  const e = err as { message?: string; code?: string; details?: string };
  const msg = `${e?.message || ''} ${e?.details || ''}`.toLowerCase();
  const code = String(e?.code || '');
  // Postgres undefined_column
  if (code === '42703') return true;
  // PostgREST / mensajes habituales
  if (msg.includes('column') && (msg.includes('does not exist') || msg.includes('unknown'))) return true;
  if (msg.includes('could not find')) return true;
  return false;
}

export const SITE_CONFIG_V7_MIGRATION_HINT =
  'Ejecute supabase/migracion-v7-site-config-visibility.sql en el SQL Editor de Supabase.';
