-- ============================================================
-- MIGRACIÓN V3: Actualizaciones BPS v2.0
--
-- Este script agrega las tablas y columnas necesarias para:
-- 1. Configuración dinámica del curso (mes/año desde el admin)
-- 2. Nuevos campos de matrícula (apellido, direcciones, ID, tracking)
--
-- INSTRUCCIONES:
-- Ve al SQL Editor de tu proyecto en Supabase y pega este contenido.
-- Luego haz clic en "Run".
-- ============================================================

-- 1. Tabla de configuración del sitio
-- Guarda valores que el admin puede cambiar (mes y año del curso)
CREATE TABLE IF NOT EXISTS site_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  course_month TEXT NOT NULL DEFAULT 'Enero',
  course_year TEXT NOT NULL DEFAULT '2026',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar configuración por defecto (solo si no existe)
INSERT INTO site_config (id, course_month, course_year)
VALUES ('default', 'Enero', '2026')
ON CONFLICT (id) DO NOTHING;

-- Habilitar seguridad por filas
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Cualquier visitante puede leer la configuración (necesario para el formulario)
CREATE POLICY "Cualquier persona puede leer la configuración"
  ON site_config FOR SELECT USING (true);

-- Solo el servicio del servidor puede modificar la configuración
CREATE POLICY "Solo servicio puede actualizar configuración"
  ON site_config FOR UPDATE USING (auth.role() = 'service_role');

-- 2. Nuevas columnas en la tabla de matrículas (registrations)
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS last_name TEXT DEFAULT '';
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS postal_address TEXT DEFAULT '';
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS physical_address TEXT DEFAULT '';
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Puerto Rico';
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS id_document_path TEXT DEFAULT '';
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS tracking_number TEXT DEFAULT '';

-- 3. Migrar datos de registros existentes (si los hay)
-- Copiar dirección anterior al nuevo campo de dirección postal
UPDATE registrations SET postal_address = address WHERE postal_address = '' AND address != '';
-- Copiar estado al nuevo campo de país
UPDATE registrations SET country = state WHERE country = 'Puerto Rico' AND state != '' AND state != 'Puerto Rico';
-- Copiar apodo al nuevo campo de apellido
UPDATE registrations SET last_name = nickname WHERE last_name = '' AND nickname != '';

-- 4. (OPCIONAL) Eliminar columnas viejas DESPUÉS de verificar que todo funciona
-- NO ejecutar estas líneas hasta confirmar que la migración esté completa
-- ALTER TABLE registrations DROP COLUMN IF EXISTS address;
-- ALTER TABLE registrations DROP COLUMN IF EXISTS county;
-- ALTER TABLE registrations DROP COLUMN IF EXISTS state;
-- ALTER TABLE registrations DROP COLUMN IF EXISTS nickname;
