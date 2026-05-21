/**
 * Acceso al zip "Documentos BPS" alojado en Supabase Storage (bucket privado).
 *
 * Mantenido aparte del módulo de certificados para no introducir regresiones
 * en lib/certificate-storage.ts.
 */

import { supabaseAdmin } from '@/lib/supabase-server';

/** Bucket privado donde se guarda el zip una sola vez. */
const BUCKET = 'documentos-publicos';
/** Path fijo dentro del bucket. Se usa sin espacios para evitar problemas en URLs firmadas. */
const STORAGE_PATH = 'Documentos-BPS.zip';
/** Tiempo de validez de la URL firmada en segundos (1 hora). */
const SIGNED_TTL = 3600;

type AttemptCheckRow = {
  id: string;
  passed: boolean | null;
  exam_type: string | null;
};

export async function getDocumentosBpsSignedUrlForAttempt(opts: {
  attemptId: string;
}): Promise<{ signedUrl: string; expiresIn: number } | { error: string; status: number }> {
  const attemptId = (opts.attemptId || '').trim();
  if (!attemptId) {
    return { error: 'attemptId requerido.', status: 400 };
  }

  const { data: attemptData, error: attemptError } = await supabaseAdmin
    .from('exam_attempts')
    .select('id, passed, exam_type')
    .eq('id', attemptId)
    .maybeSingle();

  if (attemptError || !attemptData) {
    return { error: 'Intento no encontrado.', status: 404 };
  }

  const attempt = attemptData as AttemptCheckRow;
  if (attempt.exam_type !== 'oficial') {
    return { error: 'Solo el examen oficial tiene acceso a estos documentos.', status: 400 };
  }
  if (!attempt.passed) {
    return { error: 'El intento no está aprobado.', status: 400 };
  }

  const { data: signedData, error: signError } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(STORAGE_PATH, SIGNED_TTL);

  if (signError || !signedData?.signedUrl) {
    return {
      error: signError?.message || 'No se pudo generar el enlace de los documentos.',
      status: 500,
    };
  }

  return { signedUrl: signedData.signedUrl, expiresIn: SIGNED_TTL };
}
