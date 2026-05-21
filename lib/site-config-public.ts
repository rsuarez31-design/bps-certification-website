/**
 * Lectura server-side de banderas de visibilidad del sitio (site_config).
 * Usado en layout, páginas públicas y guards de ruta.
 */

import { cache } from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase-server';
import {
  isMissingSiteConfigExamWindowColumnsError,
  isMissingSiteConfigVisibilityColumnsError,
} from '@/lib/site-config-errors';
import { isOfficialExamPubliclyVisible } from '@/lib/site-config-exam-window';
import { parseVisibilityBool } from '@/lib/site-config-visibility-parse';

export type SiteVisibilityFlags = {
  enrollmentEnabled: boolean;
  officialExamEnabled: boolean;
};

const DEFAULTS: SiteVisibilityFlags = {
  enrollmentEnabled: true,
  officialExamEnabled: false,
};

const RESTRICTIVE_WHEN_SCHEMA_MISSING: SiteVisibilityFlags = {
  enrollmentEnabled: false,
  officialExamEnabled: false,
};

const SITE_CONFIG_LOG_HINT_MISSING_COL =
  'Se desactivan rutas sensibles hasta aplicar migración v7.';

const SITE_CONFIG_LOG_HINT_MISSING_EXAM_WINDOW =
  'Examen oficial oculto hasta aplicar migración v12.';

/**
 * Lee enrollment_enabled y ventana del examen desde Supabase.
 * - Examen visible solo si hay rango configurado y now está dentro del rango (PR).
 * - Columnas v7 ausentes: rutas sensibles desactivadas.
 * - Columnas v12 ausentes: examen oculto; matrícula según enrollment_enabled si existe.
 */
async function loadSiteVisibilityFlags(): Promise<SiteVisibilityFlags> {
  noStore();
  try {
    const { data, error } = await supabaseAdmin
      .from('site_config')
      .select('enrollment_enabled, official_exam_start_at, official_exam_end_at')
      .eq('id', 'default')
      .maybeSingle();

    if (error) {
      if (isMissingSiteConfigVisibilityColumnsError(error)) {
        console.warn(
          '[site-config-public] site_config sin columnas de visibilidad;',
          SITE_CONFIG_LOG_HINT_MISSING_COL,
          error,
        );
        return RESTRICTIVE_WHEN_SCHEMA_MISSING;
      }
      if (isMissingSiteConfigExamWindowColumnsError(error)) {
        console.warn(
          '[site-config-public] site_config sin ventana de examen;',
          SITE_CONFIG_LOG_HINT_MISSING_EXAM_WINDOW,
          error,
        );
        return { enrollmentEnabled: true, officialExamEnabled: false };
      }
      console.warn('[site-config-public] Error leyendo site_config; usando fallback.', error);
      return DEFAULTS;
    }
    if (!data) {
      console.warn('[site-config-public] Sin fila site_config id=default; examen oculto.');
      return DEFAULTS;
    }

    const row = data as {
      enrollment_enabled?: unknown;
      official_exam_start_at?: string | null;
      official_exam_end_at?: string | null;
    };

    return {
      enrollmentEnabled: parseVisibilityBool(row.enrollment_enabled, true),
      officialExamEnabled: isOfficialExamPubliclyVisible(
        row.official_exam_start_at,
        row.official_exam_end_at,
      ),
    };
  } catch (e) {
    console.warn('[site-config-public] Excepción en loadSiteVisibilityFlags; usando fallback.', e);
    return DEFAULTS;
  }
}

/** Una lectura por petición del servidor (layout + páginas async comparten resultado). */
export const getSiteVisibilityFlags = cache(loadSiteVisibilityFlags);
