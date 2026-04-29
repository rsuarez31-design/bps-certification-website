-- ============================================================
-- MIGRACIÓN V6: origen de matrícula y notas internas
--
-- Permite distinguir matrículas online por Stripe vs manuales
-- creadas por admin (pago en persona), y guardar notas internas.
-- ============================================================

ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS enrollment_source TEXT NOT NULL DEFAULT 'online_stripe';

ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS internal_notes TEXT DEFAULT '';

ALTER TABLE registrations
  DROP CONSTRAINT IF EXISTS registrations_enrollment_source_check;

ALTER TABLE registrations
  ADD CONSTRAINT registrations_enrollment_source_check
  CHECK (enrollment_source IN ('online_stripe', 'manual_in_person'));

UPDATE registrations
SET enrollment_source = 'online_stripe'
WHERE enrollment_source IS NULL OR enrollment_source = '';
