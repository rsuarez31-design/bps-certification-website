/**
 * RUTA API: Leer y actualizar la configuración del curso (mes, año y visibilidad de páginas).
 * GET  -> devuelve la configuración actual (público; necesario para UI coherente)
 * PUT  -> actualiza (requiere sesión de administrador)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { hasValidAdminSession } from '@/lib/admin-session';
import {
  isMissingSiteConfigVisibilityColumnsError,
  SITE_CONFIG_V7_MIGRATION_HINT,
} from '@/lib/site-config-errors';
import { parseVisibilityBool } from '@/lib/site-config-visibility-parse';

export const dynamic = 'force-dynamic';

function parseBool(v: unknown, fallback: boolean): boolean {
  if (typeof v === 'boolean') return v;
  if (v === 'true' || v === 1) return true;
  if (v === 'false' || v === 0) return false;
  return fallback;
}

function visibilityMigrationResponse() {
  return NextResponse.json(
    {
      error: SITE_CONFIG_V7_MIGRATION_HINT,
      visibility_columns_missing: true,
      migration_file: 'supabase/migracion-v7-site-config-visibility.sql',
    },
    { status: 503 },
  );
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('site_config')
      .select('course_month, course_year, official_exam_enabled, enrollment_enabled')
      .eq('id', 'default')
      .maybeSingle();

    if (error) {
      if (isMissingSiteConfigVisibilityColumnsError(error)) {
        console.error('[GET /api/admin/config]', error.message);
        return visibilityMigrationResponse();
      }
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
      official_exam_enabled: parseVisibilityBool(row.official_exam_enabled, true),
      enrollment_enabled: parseVisibilityBool(row.enrollment_enabled, true),
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

    const { error } = await supabaseAdmin.from('site_config').update(patch).eq('id', 'default');

    if (error) {
      if (isMissingSiteConfigVisibilityColumnsError(error)) {
        console.error('[PUT /api/admin/config] Columnas de visibilidad ausentes:', error.message);
        return visibilityMigrationResponse();
      }
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
