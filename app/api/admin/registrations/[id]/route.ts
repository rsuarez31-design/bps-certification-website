import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { hasValidAdminSession } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

const EDITABLE_FIELDS = [
  'course_name',
  'course_date',
  'full_name',
  'last_name',
  'postal_address',
  'physical_address',
  'city',
  'country',
  'zip_code',
  'phone',
  'cellphone',
  'email',
  'gender',
  'birth_date',
  'is_minor',
  'parent_guardian_signature',
  'parent_guardian_signed_at',
  'hair_color',
  'eye_color',
  'height_feet',
  'height_inches',
  'boat_type',
  'boat_length',
  'has_trailer',
  'years_experience',
  'motor_power',
  'tracking_number',
] as const;

type EditableField = (typeof EDITABLE_FIELDS)[number];
type RegistrationPatch = Partial<Record<EditableField, string | boolean | null>>;

function cleanText(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function toBool(value: unknown): boolean {
  return value === true;
}

async function signedUrl(path: string): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabaseAdmin.storage.from('id-documents').createSignedUrl(path, 3600);
  if (error) return null;
  return data?.signedUrl || null;
}

export async function PUT(
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

    const body = await request.json();
    const patch: RegistrationPatch = {};

    EDITABLE_FIELDS.forEach((field) => {
      if (!(field in body)) return;
      if (field === 'is_minor') {
        patch[field] = toBool(body[field]);
        return;
      }
      patch[field] = cleanText(body[field]);
    });

    // Si no es menor, limpiamos firma/fecha de tutor para coherencia.
    if (patch.is_minor === false) {
      patch.parent_guardian_signature = null;
      patch.parent_guardian_signed_at = null;
    }

    if (typeof patch.email === 'string' && !patch.email.includes('@')) {
      return NextResponse.json({ error: 'El email no es válido.' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('registrations')
      .update(patch)
      .eq('id', registrationId)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Matrícula no encontrada.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      registration: {
        ...data,
        id_document_url: await signedUrl(data.id_document_path || ''),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
