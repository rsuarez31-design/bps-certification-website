import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { hasValidAdminSession } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

const BUCKET = 'id-documents';
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']);

function extFromType(type: string): string {
  if (type === 'application/pdf') return 'pdf';
  if (type === 'image/png') return 'png';
  return 'jpg';
}

function cleanText(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim();
}

async function buildSignedUrl(path: string): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(path, 3600);
  if (error) return null;
  return data?.signedUrl || null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!hasValidAdminSession(request)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const registrationId = cleanText(params.id);
    if (!registrationId) {
      return NextResponse.json({ error: 'ID de matrícula inválido.' }, { status: 400 });
    }

    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Archivo no enviado o inválido.' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'El archivo excede 5 MB.' }, { status: 400 });
    }
    if (!ALLOWED_MIME.has(file.type)) {
      return NextResponse.json({ error: 'Solo se permiten JPG, PNG o PDF.' }, { status: 400 });
    }

    const { data: existing, error: readError } = await supabaseAdmin
      .from('registrations')
      .select('id_document_path')
      .eq('id', registrationId)
      .single();

    if (readError) {
      return NextResponse.json({ error: readError.message }, { status: 500 });
    }

    const ext = extFromType(file.type);
    const objectPath = `${registrationId}_${Date.now()}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(objectPath, bytes, { contentType: file.type, upsert: false });
    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { error: updateError } = await supabaseAdmin
      .from('registrations')
      .update({ id_document_path: objectPath })
      .eq('id', registrationId);
    if (updateError) {
      await supabaseAdmin.storage.from(BUCKET).remove([objectPath]);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    if (existing?.id_document_path) {
      await supabaseAdmin.storage.from(BUCKET).remove([existing.id_document_path]);
    }

    return NextResponse.json({
      success: true,
      id_document_path: objectPath,
      id_document_url: await buildSignedUrl(objectPath),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
