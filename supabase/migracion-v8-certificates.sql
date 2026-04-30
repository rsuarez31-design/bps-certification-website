-- ============================================================
-- MIGRACIÓN V8: Certificados PDF del examen oficial
--
-- 1) Columnas en exam_attempts para ruta del PDF y metadatos
-- 2) Bucket privado "certificates" en Storage
--
-- Ejecutar en SQL Editor de Supabase después de desplegar el código.
-- ============================================================

ALTER TABLE exam_attempts
  ADD COLUMN IF NOT EXISTS certificate_pdf_path TEXT;

ALTER TABLE exam_attempts
  ADD COLUMN IF NOT EXISTS certificate_id TEXT;

ALTER TABLE exam_attempts
  ADD COLUMN IF NOT EXISTS certificate_issued_at TIMESTAMPTZ;

INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', false)
ON CONFLICT (id) DO NOTHING;
