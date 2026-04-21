-- =============================================================
-- KEEP ALIVE (segunda capa) usando pg_cron DENTRO de Supabase
--
-- Este script crea un job interno en Postgres que se ejecuta
-- cada 24 horas y hace una consulta trivial contra la tabla
-- exam_questions. Esto asegura que exista actividad diaria
-- registrada a nivel de base de datos, incluso si la GitHub
-- Action no se ejecuta por cualquier motivo.
--
-- COMO EJECUTARLO:
--   1. Abre el dashboard de Supabase -> SQL Editor.
--   2. Copia y pega TODO el contenido de este archivo.
--   3. Haz click en "Run". Se ejecuta una sola vez.
--   4. Queda instalado para siempre (sobrevive a reinicios).
--
-- COMO VERIFICARLO:
--   SELECT jobid, jobname, schedule, active
--     FROM cron.job
--    WHERE jobname = 'keep_alive_bps';
--
--   SELECT * FROM cron.job_run_details
--    WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'keep_alive_bps')
--    ORDER BY start_time DESC
--    LIMIT 10;
--
-- COMO DESINSTALARLO (si algun dia no lo quieres):
--   SELECT cron.unschedule('keep_alive_bps');
--
-- NOTA SOBRE EL PLAN FREE:
--   pg_cron viene disponible en el plan gratuito de Supabase.
--   Solo necesita activarse la extension una vez (lo hace este script).
-- =============================================================

-- 1) Habilitar la extension pg_cron (idempotente).
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2) Asegurar que no exista un job previo con el mismo nombre
--    para que este script sea seguro de re-ejecutar.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'keep_alive_bps') THEN
    PERFORM cron.unschedule('keep_alive_bps');
  END IF;
END
$$;

-- 3) Programar el job: cada dia a las 07:17 UTC (horario arbitrario
--    fuera de la hora en punto para evitar picos de carga).
--    La consulta es intencionalmente barata: lee un solo id.
SELECT cron.schedule(
  'keep_alive_bps',
  '17 7 * * *',
  $$SELECT id FROM public.exam_questions ORDER BY id LIMIT 1$$
);

-- 4) Confirmacion inmediata para el SQL Editor.
SELECT jobid,
       jobname,
       schedule,
       active,
       database
  FROM cron.job
 WHERE jobname = 'keep_alive_bps';
