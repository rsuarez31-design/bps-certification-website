-- ============================================================
-- MIGRACIÓN V7: Visibilidad de páginas públicas (Examen / Matrícula)
--
-- Agrega banderas en site_config para activar o desactivar:
-- - official_exam_enabled: página /examen
-- - enrollment_enabled: página /matricula y CTAs de inscripción
--
-- Por defecto ambas están activadas (true).
-- Ejecutar en SQL Editor de Supabase después de desplegar el código que las usa.
-- ============================================================

ALTER TABLE site_config
  ADD COLUMN IF NOT EXISTS official_exam_enabled BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE site_config
  ADD COLUMN IF NOT EXISTS enrollment_enabled BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE site_config
SET
  official_exam_enabled = COALESCE(official_exam_enabled, TRUE),
  enrollment_enabled = COALESCE(enrollment_enabled, TRUE)
WHERE id = 'default';
