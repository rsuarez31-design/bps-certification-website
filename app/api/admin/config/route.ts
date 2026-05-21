/**
 * RUTA API: Leer y actualizar la configuración del curso (mes, año y visibilidad de páginas).
 * GET  -> devuelve la configuración actual (público; necesario para UI coherente)
 * PUT  -> actualiza (requiere sesión de administrador)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { hasValidAdminSession } from '@/lib/admin-session';
import {
  isMissingSiteConfigExamWindowColumnsError,
  isMissingSiteConfigVisibilityColumnsError,
  SITE_CONFIG_V12_MIGRATION_HINT,
  SITE_CONFIG_V7_MIGRATION_HINT,
} from '@/lib/site-config-errors';
import {
  formatDateTimeLocalForPuertoRico,
  isOfficialExamPubliclyVisible,
  validateExamWindowInput,
} from '@/lib/site-config-exam-window';
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

function examWindowMigrationResponse() {
  return NextResponse.json(
    {
      error: SITE_CONFIG_V12_MIGRATION_HINT,
      exam_window_columns_missing: true,
      migration_file: 'supabase/migracion-v12-official-exam-window.sql',
    },
    { status: 503 },
  );
}

function serializeExamWindow(row: Record<string, unknown>) {
  const startAt = (row.official_exam_start_at as string | null) ?? null;
  const endAt = (row.official_exam_end_at as string | null) ?? null;
  return {
    official_exam_start_at: startAt,
    official_exam_end_at: endAt,
    official_exam_start_local: formatDateTimeLocalForPuertoRico(startAt),
    official_exam_end_local: formatDateTimeLocalForPuertoRico(endAt),
    official_exam_visible_now: isOfficialExamPubliclyVisible(startAt, endAt),
  };
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('site_config')
      .select(
        'course_month, course_year, enrollment_enabled, official_exam_start_at, official_exam_end_at',
      )
      .eq('id', 'default')
      .maybeSingle();

    if (error) {
      if (isMissingSiteConfigExamWindowColumnsError(error)) {
        console.error('[GET /api/admin/config]', error.message);
        return examWindowMigrationResponse();
      }
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
        enrollment_enabled: true,
        official_exam_start_at: null,
        official_exam_end_at: null,
        official_exam_start_local: '',
        official_exam_end_local: '',
        official_exam_visible_now: false,
      });
    }

    const row = data as Record<string, unknown>;
    return NextResponse.json({
      course_month: row.course_month,
      course_year: row.course_year,
      enrollment_enabled: parseVisibilityBool(row.enrollment_enabled, true),
      ...serializeExamWindow(row),
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
    const {
      course_month,
      course_year,
      enrollment_enabled,
      official_exam_start_at,
      official_exam_end_at,
    } = body;

    if (!course_month || !course_year) {
      return NextResponse.json({ error: 'Se requiere course_month y course_year' }, { status: 400 });
    }

    const windowResult = validateExamWindowInput(
      official_exam_start_at != null ? String(official_exam_start_at) : '',
      official_exam_end_at != null ? String(official_exam_end_at) : '',
    );
    if (!windowResult.ok) {
      return NextResponse.json({ error: windowResult.error }, { status: 400 });
    }

    const enrollOn = parseBool(enrollment_enabled, true);

    const patch: Record<string, unknown> = {
      id: 'default',
      course_month,
      course_year,
      enrollment_enabled: enrollOn,
      official_exam_start_at: windowResult.startAt ? windowResult.startAt.toISOString() : null,
      official_exam_end_at: windowResult.endAt ? windowResult.endAt.toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    const { data: upserted, error } = await supabaseAdmin
      .from('site_config')
      .upsert(patch, { onConflict: 'id' })
      .select(
        'course_month, course_year, enrollment_enabled, official_exam_start_at, official_exam_end_at',
      )
      .eq('id', 'default')
      .maybeSingle();

    if (error) {
      if (isMissingSiteConfigExamWindowColumnsError(error)) {
        console.error('[PUT /api/admin/config] Columnas de ventana ausentes:', error.message);
        return examWindowMigrationResponse();
      }
      if (isMissingSiteConfigVisibilityColumnsError(error)) {
        console.error('[PUT /api/admin/config] Columnas de visibilidad ausentes:', error.message);
        return visibilityMigrationResponse();
      }
      console.error('Error al actualizar config:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!upserted) {
      console.error('[PUT /api/admin/config] Upsert sin fila devuelta');
      return NextResponse.json(
        { error: 'No se pudo persistir la configuración (fila no encontrada tras upsert).' },
        { status: 500 },
      );
    }

    const persisted = upserted as Record<string, unknown>;
    return NextResponse.json({
      success: true,
      course_month: persisted.course_month,
      course_year: persisted.course_year,
      enrollment_enabled: parseVisibilityBool(persisted.enrollment_enabled, true),
      ...serializeExamWindow(persisted),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Error inesperado en PUT config:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
