-- ============================================================
-- MIGRACION V11: Mes y ano de seccion del curso por matricula
--
-- Agrega course_month y course_year a registrations para filtrar
-- y mostrar la seccion del curso sin depender del texto de course_name.
-- ============================================================

BEGIN;

ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS course_month TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS course_year TEXT NOT NULL DEFAULT '';

-- Backfill desde course_name con formato "... - {Mes} - {Ano}"
UPDATE registrations
SET
  course_month = parts.month_part,
  course_year = parts.year_part
FROM (
  SELECT
    id,
    TRIM(split_part(course_name, ' - ', 2)) AS month_part,
    TRIM(split_part(course_name, ' - ', 3)) AS year_part
  FROM registrations
  WHERE course_name LIKE '% - % - %'
) AS parts
WHERE registrations.id = parts.id
  AND parts.month_part IN (
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  )
  AND parts.year_part ~ '^\d{4}$';

COMMIT;

-- Verificacion
SELECT
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE course_month <> '') AS con_mes,
  COUNT(*) FILTER (WHERE course_year <> '') AS con_ano
FROM registrations;
