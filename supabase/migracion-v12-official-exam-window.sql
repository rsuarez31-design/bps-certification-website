-- ============================================================
-- MIGRACIÓN V12: Ventana de disponibilidad del examen oficial
--
-- Reemplaza el toggle official_exam_enabled por un rango de fechas/horas.
-- Sin backfill: NULL = examen oculto hasta que el admin configure el rango.
-- Ejecutar en SQL Editor de Supabase antes o junto al deploy del código.
-- ============================================================

ALTER TABLE site_config
  ADD COLUMN IF NOT EXISTS official_exam_start_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS official_exam_end_at TIMESTAMPTZ;
