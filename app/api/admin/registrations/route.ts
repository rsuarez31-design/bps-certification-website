/**
 * RUTA API: Lectura de matrículas pagadas para el panel administrativo.
 * Solo devuelve registros con pago confirmado (no borradores ni cancelados).
 *
 * Query params opcionales:
 *   &month=Enero
 *   &year=2026
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { hasValidAdminSession } from '@/lib/admin-session';
import { sendWelcomeEmailForRegistration } from '@/lib/registration-email-events';

export const dynamic = 'force-dynamic';

const DEFAULT_COURSE_NAME = 'Curso de Navegación';
const DEFAULT_COURSE_DATE = '';
const DEFAULT_COUNTRY = 'Puerto Rico';
const AMOUNT_BASE_CENTS = 8000;
const AMOUNT_WITH_BOOK_CENTS = 9300;

function asText(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function asBool(value: unknown): boolean {
  return value === true;
}

async function buildSignedUrl(path: string): Promise<string | null> {
  if (!path) return null;
  try {
    const { data: signedData, error: signErr } = await supabaseAdmin.storage
      .from('id-documents')
      .createSignedUrl(path, 3600);
    if (signErr) return null;
    return signedData?.signedUrl || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || '';
    const year = searchParams.get('year') || '';

    let query = supabaseAdmin
      .from('registrations')
      .select('*')
      .in('payment_status', ['paid', 'Paid'])
      .order('created_at', { ascending: false });

    if (month && month !== 'Todos') {
      query = query.ilike('course_name', `%${month}%`);
    }
    if (year && year !== 'Todos') {
      query = query.ilike('course_name', `%${year}%`);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const registrosConUrls = await Promise.all((data || []).map(async (reg) => ({
      ...reg,
      id_document_url: await buildSignedUrl(reg.id_document_path || ''),
    })));

    return NextResponse.json({ registrations: registrosConUrls });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!hasValidAdminSession(request)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const body = await request.json();

    const courseName = asText(body?.course_name) || DEFAULT_COURSE_NAME;
    const courseDate = asText(body?.course_date) || DEFAULT_COURSE_DATE;
    const fullName = asText(body?.full_name);
    const lastName = asText(body?.last_name);
    const postalAddress = asText(body?.postal_address);
    const physicalAddress = asText(body?.physical_address) || postalAddress;
    const city = asText(body?.city);
    const country = asText(body?.country) || DEFAULT_COUNTRY;
    const zipCode = asText(body?.zip_code);
    const phone = asText(body?.phone);
    const cellphone = asText(body?.cellphone);
    const email = asText(body?.email).toLowerCase();
    const gender = asText(body?.gender);
    const birthDate = asText(body?.birth_date);
    const isMinor = asBool(body?.is_minor);
    const parentGuardianSignature = asText(body?.parent_guardian_signature);
    const parentGuardianSignedAt = asText(body?.parent_guardian_signed_at);
    const hairColor = asText(body?.hair_color);
    const eyeColor = asText(body?.eye_color);
    const heightFeet = asText(body?.height_feet);
    const heightInches = asText(body?.height_inches);
    const boatType = asText(body?.boat_type);
    const boatLength = asText(body?.boat_length);
    const hasTrailer = asText(body?.has_trailer);
    const yearsExperience = asText(body?.years_experience);
    const motorPower = asText(body?.motor_power);
    const trackingNumber = asText(body?.tracking_number);
    const wantsBookShipping = asBool(body?.wants_book_shipping);
    const paymentStatus = 'paid';
    const enrollmentSource = asText(body?.enrollment_source) || 'manual_in_person';
    const internalNotes = asText(body?.internal_notes);

    if (!fullName || !email || !phone || !gender || !birthDate) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios: nombre, email, teléfono, sexo y fecha de nacimiento.' },
        { status: 400 }
      );
    }

    const amountTotalCents = wantsBookShipping ? AMOUNT_WITH_BOOK_CENTS : AMOUNT_BASE_CENTS;

    const payload = {
      course_name: courseName,
      course_date: courseDate,
      full_name: fullName,
      last_name: lastName,
      postal_address: postalAddress,
      physical_address: physicalAddress,
      city,
      country,
      zip_code: zipCode,
      phone,
      cellphone,
      email,
      gender,
      birth_date: birthDate,
      is_minor: isMinor,
      parent_guardian_signature: isMinor ? parentGuardianSignature : null,
      parent_guardian_signed_at: isMinor ? parentGuardianSignedAt : null,
      hair_color: hairColor,
      eye_color: eyeColor,
      height_feet: heightFeet,
      height_inches: heightInches,
      boat_type: boatType,
      boat_length: boatLength,
      has_trailer: hasTrailer,
      years_experience: yearsExperience,
      motor_power: motorPower,
      wants_book_shipping: wantsBookShipping,
      amount_total_cents: amountTotalCents,
      payment_status: paymentStatus,
      tracking_number: trackingNumber,
      enrollment_source: enrollmentSource,
      internal_notes: internalNotes,
      stripe_checkout_session_id: null,
      stripe_payment_intent_id: null,
    };

    let insertPayload: Record<string, unknown> = payload;
    let data: any = null;
    let error: any = null;

    ({ data, error } = await supabaseAdmin
      .from('registrations')
      .insert(insertPayload)
      .select('*')
      .single());

    if (error && String(error.message || '').includes('enrollment_source')) {
      // Compatibilidad: si la migración opcional aún no se aplicó,
      // repetimos el insert sin columnas nuevas.
      const { enrollment_source: _ignoreSource, internal_notes: _ignoreNotes, ...legacyPayload } = payload;
      insertPayload = legacyPayload;
      ({ data, error } = await supabaseAdmin
        .from('registrations')
        .insert(insertPayload)
        .select('*')
        .single());
    }

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'No se pudo crear la matrícula manual.' }, { status: 500 });
    }

    await sendWelcomeEmailForRegistration(data.id as string);

    return NextResponse.json({ success: true, registration: { ...data, id_document_url: null } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
