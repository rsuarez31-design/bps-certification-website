/**
 * RUTA API: Leer y actualizar la configuración del curso (mes, año y visibilidad de páginas).
 * GET  -> devuelve la configuración actual (público; necesario para UI coherente)
 * PUT  -> actualiza (requiere sesión de administrador)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { hasValidAdminSession } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

function parseBool(v: unknown, fallback: boolean): boolean {
  if (typeof v === 'boolean') return v;
  if (v === 'true' || v === 1) return true;
  if (v === 'false' || v === 0) return false;
  return fallback;
}

export async function GET() {
  try {
    let { data, error } = await supabaseAdmin
      .from('site_config')
      .select('course_month, course_year, official_exam_enabled, enrollment_enabled')
      .eq('id', 'default')
      .maybeSingle();

    if (error && String(error.message || '').includes('column')) {
      const legacy = await supabaseAdmin
        .from('site_config')
        .select('course_month, course_year')
        .eq('id', 'default')
        .maybeSingle();
      if (legacy.error) {
        console.error('Error al leer config:', legacy.error);
        return NextResponse.json({ error: legacy.error.message }, { status: 500 });
      }
      data = {
        ...legacy.data,
        official_exam_enabled: true,
        enrollment_enabled: true,
      } as typeof data;
      error = null;
    }

    if (error) {
      console.error('Error al leer config:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({
        course_month: 'Enero',
        course_year: '2026',
        official_exam_enabled: true,
        enrollment_enabled: true,
      });
    }

    const row = data as Record<string, unknown>;
    return NextResponse.json({
      course_month: row.course_month,
      course_year: row.course_year,
      official_exam_enabled: parseBool(row.official_exam_enabled, true),
      enrollment_enabled: parseBool(row.enrollment_enabled, true),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Error inesperado en GET config:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!hasValidAdminSession(request)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { course_month, course_year, official_exam_enabled, enrollment_enabled } = body;

    if (!course_month || !course_year) {
      return NextResponse.json({ error: 'Se requiere course_month y course_year' }, { status: 400 });
    }

    const examOn = parseBool(official_exam_enabled, true);
    const enrollOn = parseBool(enrollment_enabled, true);

    const patch = {
      course_month,
      course_year,
      official_exam_enabled: examOn,
      enrollment_enabled: enrollOn,
      updated_at: new Date().toISOString(),
    };

    let { error } = await supabaseAdmin
      .from('site_config')
      .update(patch)
      .eq('id', 'default');

    if (error && String(error.message || '').includes('column')) {
      const { enrollment_enabled: _e, official_exam_enabled: _o, ...legacyPatch } = patch;
      ({ error } = await supabaseAdmin
        .from('site_config')
        .update(legacyPatch)
        .eq('id', 'default'));
    }

    if (error) {
      console.error('Error al actualizar config:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Error inesperado en PUT config:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
