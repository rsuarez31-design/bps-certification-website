/**
 * Interpreta valores booleanos de site_config para visibilidad pública.
 * Trata explícitamente strings ("false") que de otro modo romperían checks !== false.
 */
export function parseVisibilityBool(raw: unknown, defaultVisible = true): boolean {
  if (raw === false || raw === 'false' || raw === 0 || raw === '0') return false;
  if (raw === true || raw === 'true' || raw === 1 || raw === '1') return true;
  if (raw === null || raw === undefined) return defaultVisible;
  return defaultVisible;
}
