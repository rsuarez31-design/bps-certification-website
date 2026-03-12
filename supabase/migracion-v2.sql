-- ============================================================
-- MIGRACIÓN V2 - Actualizar tablas existentes
--
-- CUÁNDO USAR ESTO:
-- Si ya ejecutaste el schema.sql ANTERIOR y tus tablas
-- ya existen en Supabase, usa ESTE archivo para actualizarlas.
--
-- QUÉ HACE:
-- 1. Agrega dos columnas nuevas a exam_attempts:
--    - student_email (correo del estudiante)
--    - registration_id (vincula con su matrícula)
-- 2. Agrega un índice nuevo para búsquedas más rápidas
-- 3. Elimina las políticas de seguridad viejas
-- 4. Crea las políticas de seguridad nuevas (más seguras)
--
-- INSTRUCCIONES:
-- 1. Ve a tu proyecto en https://supabase.com/dashboard
-- 2. Haz clic en "SQL Editor" en el menú de la izquierda
-- 3. Haz clic en "New query" (Nueva consulta)
-- 4. Pega TODO este contenido
-- 5. Haz clic en el botón "Run" (Ejecutar)
-- 6. Deberías ver "Success" (Éxito) abajo
-- ============================================================

-- ============================================================
-- PASO 1: Agregar columnas nuevas a exam_attempts
-- ============================================================
-- "student_email" guarda el correo del estudiante que tomó el examen
-- Si la columna ya existe, este comando simplemente no hace nada
ALTER TABLE exam_attempts
  ADD COLUMN IF NOT EXISTS student_email TEXT DEFAULT '';

-- "registration_id" conecta el intento de examen con la matrícula del estudiante
-- Esto permite saber qué estudiante registrado tomó qué examen
ALTER TABLE exam_attempts
  ADD COLUMN IF NOT EXISTS registration_id UUID REFERENCES registrations(id);

-- ============================================================
-- PASO 2: Agregar índices nuevos (hacen las búsquedas más rápidas)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_registrations_email
  ON registrations(email);

CREATE INDEX IF NOT EXISTS idx_exam_attempts_registration
  ON exam_attempts(registration_id);

-- ============================================================
-- PASO 3: Eliminar las políticas de seguridad VIEJAS
-- (Las viejas permitían que cualquiera leyera las matrículas,
--  lo cual exponía datos personales de los estudiantes)
-- ============================================================
-- Primero eliminamos las que puedan existir con los nombres viejos
DROP POLICY IF EXISTS "Cualquier persona puede leer su matrícula" ON registrations;
DROP POLICY IF EXISTS "Actualizar matrículas (para webhooks)" ON registrations;

-- También eliminar si ya existen las nuevas (para poder recrearlas sin error)
DROP POLICY IF EXISTS "Solo servicio puede leer matrículas" ON registrations;
DROP POLICY IF EXISTS "Solo servicio puede actualizar matrículas" ON registrations;

-- ============================================================
-- PASO 4: Crear las políticas de seguridad NUEVAS
-- ============================================================
-- Ahora SOLO el servidor (service_role) puede leer los datos de matrículas
-- Esto significa que un visitante del sitio NO puede ver datos de otros estudiantes
CREATE POLICY "Solo servicio puede leer matrículas"
  ON registrations FOR SELECT USING (
    auth.role() = 'service_role'
  );

-- Solo el servidor puede actualizar matrículas (para el webhook de Stripe)
CREATE POLICY "Solo servicio puede actualizar matrículas"
  ON registrations FOR UPDATE USING (
    auth.role() = 'service_role'
  );

-- ============================================================
-- ¡LISTO! Si ves "Success" abajo, la actualización fue exitosa.
-- ============================================================
