/**
 * RUTA API: Imagen de una pregunta del examen
 *
 * POST   /api/admin/questions/:id/image  -> sube una imagen al bucket
 *                                           exam-images y guarda la URL
 *                                           publica en exam_questions.image_url
 *
 * DELETE /api/admin/questions/:id/image  -> borra el archivo del bucket
 *                                           (cuando fue subido desde aqui)
 *                                           y limpia exam_questions.image_url
 *
 * Reglas:
 * - Solo acepta imagenes JPG o PNG, maximo 5 MB.
 * - Las imagenes se guardan como exam-images/question-<id>-<timestamp>.<ext>
 *   para evitar colisiones y poder mantener historial si se quisiera.
 * - La imagen por defecto de la pregunta #28 (`/exam-images/boat-q28.png`)
 *   viene bundled en /public y no fue subida al bucket, por lo que el
 *   DELETE detecta ese caso y NO intenta borrar un archivo inexistente
 *   del bucket; solo limpia el campo image_url en la base.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const BUCKET = 'exam-images';
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png']);

function extFromType(type: string): string {
  if (type === 'image/png') return 'png';
  return 'jpg';
}

/**
 * Devuelve la ruta (path dentro del bucket) si la URL es del bucket
 * exam-images en Supabase Storage. Si la URL es una ruta relativa
 * (ej. /exam-images/boat-q28.png bundled en /public), devuelve null.
 */
function extraerPathDelBucket(imageUrl: string): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('/')) return null; // ruta relativa de /public
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = imageUrl.indexOf(marker);
  if (idx === -1) return null;
  return imageUrl.slice(idx + marker.length);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questionId = Number(params.id);
    if (!Number.isInteger(questionId) || questionId < 1) {
      return NextResponse.json({ error: 'ID de pregunta invalido' }, { status: 400 });
    }

    const form = await request.formData();
    const file = form.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Archivo no enviado o invalido' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'El archivo excede 5 MB' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Solo se permiten imagenes JPG o PNG' }, { status: 400 });
    }

    const ext = extFromType(file.type);
    const objectPath = `question-${questionId}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(objectPath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(objectPath);

    const publicUrl = publicUrlData?.publicUrl || '';

    const { error: updateError } = await supabaseAdmin
      .from('exam_questions')
      .update({ image_url: publicUrl })
      .eq('id', questionId);

    if (updateError) {
      // Intentamos limpiar el archivo recien subido para no dejar huerfanos.
      await supabaseAdmin.storage.from(BUCKET).remove([objectPath]);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, image_url: publicUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questionId = Number(params.id);
    if (!Number.isInteger(questionId) || questionId < 1) {
      return NextResponse.json({ error: 'ID de pregunta invalido' }, { status: 400 });
    }

    const { data: row, error: readError } = await supabaseAdmin
      .from('exam_questions')
      .select('image_url')
      .eq('id', questionId)
      .single();

    if (readError) {
      return NextResponse.json({ error: readError.message }, { status: 500 });
    }

    // Si la imagen vive en el bucket, intentamos borrar el archivo.
    // Si es una ruta relativa de /public (bundled), solo limpiamos el campo.
    const pathInBucket = extraerPathDelBucket(row?.image_url || '');
    if (pathInBucket) {
      const { error: removeError } = await supabaseAdmin.storage
        .from(BUCKET)
        .remove([pathInBucket]);
      if (removeError) {
        // No es fatal: seguimos y limpiamos la columna de todas formas.
        console.warn('No se pudo eliminar archivo del bucket:', removeError.message);
      }
    }

    const { error: updateError } = await supabaseAdmin
      .from('exam_questions')
      .update({ image_url: '' })
      .eq('id', questionId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
