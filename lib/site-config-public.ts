/**
 * Lectura server-side de banderas de visibilidad del sitio (site_config).
 * Usado en layout, páginas públicas y guards de ruta.
 */

import { cache } from 'react';
import { supabaseAdmin } from '@/lib/supabase-server';
import { isMissingSiteConfigVisibilityColumnsError } from '@/lib/site-config-errors';
import { parseVisibilityBool } from '@/lib/site-config-visibility-parse';

export type SiteVisibilityFlags = {
  enrollmentEnabled: boolean;
  officialExamEnabled: boolean;
};

const DEFAULTS: SiteVisibilityFlags = {
  enrollmentEnabled: true,
  officialExamEnabled: true,
};

const RESTRICTIVE_WHEN_SCHEMA_MISSING: SiteVisibilityFlags = {
  enrollmentEnabled: false,
  officialExamEnabled: false,
};

const SITE_CONFIG_LOG_HINT_MISSING_COL =
  'Se desactivan rutas sensibles hasta aplicar migración v7.';

/**
 * Lee enrollment_enabled y official_exam_enabled desde Supabase.
 * - Valores en BD se interpretan con parseVisibilityBool (incl. string "false").
 * - Columnas ausentes (migración v7): rutas sensibles desactivadas + log.
 * - Otros errores de lectura: fallback "todo visible" + log (sitio usable si Supabase falla).
 */
async function loadSiteVisibilityFlags(): Promise<SiteVisibilityFlags> {
  try {
    const { data, error } = await supabaseAdmin
      .from('site_config')
      .select('enrollment_enabled, official_exam_enabled')
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
      console.warn('[site-config-public] Error leyendo site_config; usando fallback visible.', error);
      return DEFAULTS;
    }
    if (!data) {
      console.warn('[site-config-public] Sin fila site_config id=default; usando fallback visible.');
      return DEFAULTS;
    }

    const row = data as {
      enrollment_enabled?: unknown;
      official_exam_enabled?: unknown;
    };

    return {
      enrollmentEnabled: parseVisibilityBool(row.enrollment_enabled, true),
      officialExamEnabled: parseVisibilityBool(row.official_exam_enabled, true),
    };
  } catch (e) {
    console.warn('[site-config-public] Excepción en loadSiteVisibilityFlags; usando fallback visible.', e);
    return DEFAULTS;
  }
}

/** Una lectura por petición del servidor (layout + páginas async comparten resultado). */
export const getSiteVisibilityFlags = cache(loadSiteVisibilityFlags);
