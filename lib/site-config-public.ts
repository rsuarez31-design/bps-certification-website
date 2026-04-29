/**
 * Lectura server-side de banderas de visibilidad del sitio (site_config).
 * Usado en layout, páginas públicas y guards de ruta.
 */

import { cache } from 'react';
import { supabaseAdmin } from '@/lib/supabase-server';

export type SiteVisibilityFlags = {
  enrollmentEnabled: boolean;
  officialExamEnabled: boolean;
};

const DEFAULTS: SiteVisibilityFlags = {
  enrollmentEnabled: true,
  officialExamEnabled: true,
};

/**
 * Lee enrollment_enabled y official_exam_enabled desde Supabase.
 * Si falla la consulta o faltan columnas (migración pendiente), devuelve todo activado.
 */
async function loadSiteVisibilityFlags(): Promise<SiteVisibilityFlags> {
  try {
    const { data, error } = await supabaseAdmin
      .from('site_config')
      .select('enrollment_enabled, official_exam_enabled')
      .eq('id', 'default')
      .maybeSingle();

    if (error) {
      // Migración v7 pendiente u otro error de esquema → comportamiento seguro (todo visible).
      return DEFAULTS;
    }
    if (!data) {
      return DEFAULTS;
    }

    const row = data as {
      enrollment_enabled?: boolean | null;
      official_exam_enabled?: boolean | null;
    };

    return {
      enrollmentEnabled: row.enrollment_enabled !== false,
      officialExamEnabled: row.official_exam_enabled !== false,
    };
  } catch {
    return DEFAULTS;
  }
}

/** Una lectura por petición del servidor (layout + páginas async comparten resultado). */
export const getSiteVisibilityFlags = cache(loadSiteVisibilityFlags);
