/**
 * Elimina una fila de matrícula solo si el pago sigue pendiente.
 * Sirve cuando el usuario cancela Checkout o la sesión expira en Stripe.
 * También borra el archivo de ID en Storage si existía.
 */

import { supabaseAdmin } from '@/lib/supabase-server';

export async function eliminarMatriculaSiPendiente(
  registrationId: string
): Promise<{ ok: boolean; reason?: string }> {
  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRe.test(registrationId)) {
    return { ok: false, reason: 'id_invalido' };
  }

  const { data: row, error: fetchErr } = await supabaseAdmin
    .from('registrations')
    .select('id, payment_status, id_document_path')
    .eq('id', registrationId)
    .maybeSingle();

  if (fetchErr) {
    return { ok: false, reason: fetchErr.message };
  }
  if (!row) {
    return { ok: false, reason: 'no_encontrada' };
  }

  const estado = (row.payment_status || '').toLowerCase().trim();
  if (estado !== 'pending') {
    return { ok: false, reason: 'ya_no_es_pendiente' };
  }

  if (row.id_document_path) {
    const { error: storageErr } = await supabaseAdmin.storage
      .from('id-documents')
      .remove([row.id_document_path]);
    if (storageErr) {
      console.warn('No se pudo borrar archivo ID:', storageErr.message);
    }
  }

  const { error: delErr } = await supabaseAdmin
    .from('registrations')
    .delete()
    .eq('id', registrationId);

  if (delErr) {
    return { ok: false, reason: delErr.message };
  }

  return { ok: true };
}
