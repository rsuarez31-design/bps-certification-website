-- ============================================================
-- ESQUEMA DE BASE DE DATOS PARA BPS
-- (Boquerón Power Squadron - Sistema de Certificación Ley 430)
--
-- Este archivo crea todas las tablas necesarias en Supabase.
-- Para usarlo: ve al "SQL Editor" en tu proyecto de Supabase
-- y pega este contenido completo, luego haz clic en "Run".
-- ============================================================

-- ----------------------------------------------------------
-- TABLA: exam_questions (Preguntas del examen)
-- Guarda las 85 preguntas con sus opciones y respuesta correcta.
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS exam_questions (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_index INT NOT NULL CHECK (correct_index BETWEEN 0 AND 3),
  hint TEXT NOT NULL DEFAULT ''
);

-- ----------------------------------------------------------
-- TABLA: registrations (Matrículas de estudiantes)
-- Guarda toda la información del formulario de matrícula.
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  course_name TEXT DEFAULT '',
  course_date TEXT DEFAULT '',
  full_name TEXT NOT NULL,
  nickname TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  county TEXT DEFAULT '',
  state TEXT DEFAULT 'Puerto Rico',
  zip_code TEXT DEFAULT '',
  phone TEXT NOT NULL,
  cellphone TEXT DEFAULT '',
  email TEXT NOT NULL,
  gender TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  is_minor BOOLEAN DEFAULT FALSE,
  parent_guardian_signature TEXT,
  parent_guardian_signed_at TEXT,
  hair_color TEXT DEFAULT '',
  eye_color TEXT DEFAULT '',
  height_feet TEXT DEFAULT '',
  height_inches TEXT DEFAULT '',
  boat_type TEXT DEFAULT '',
  boat_length TEXT DEFAULT '',
  has_trailer TEXT DEFAULT '',
  years_experience TEXT DEFAULT '',
  motor_power TEXT DEFAULT '',
  wants_book_shipping BOOLEAN DEFAULT FALSE,
  amount_total_cents INT DEFAULT 8000,
  payment_status TEXT DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed')),
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT
);

-- ----------------------------------------------------------
-- TABLA: exam_attempts (Intentos de examen)
-- Cada vez que un estudiante toma un examen, se crea un registro.
-- Ahora incluye registration_id para vincular con la matrícula.
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS exam_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  student_name TEXT NOT NULL,
  student_email TEXT DEFAULT '',
  registration_id UUID REFERENCES registrations(id),
  exam_type TEXT NOT NULL DEFAULT 'oficial'
    CHECK (exam_type IN ('practica', 'oficial')),
  total_questions INT NOT NULL,
  correct_answers INT NOT NULL DEFAULT 0,
  incorrect_answers INT NOT NULL DEFAULT 0,
  unanswered INT NOT NULL DEFAULT 0,
  percentage INT NOT NULL DEFAULT 0,
  passed BOOLEAN NOT NULL DEFAULT FALSE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ----------------------------------------------------------
-- TABLA: exam_attempt_answers (Respuestas por intento)
-- Guarda cada respuesta que el estudiante seleccionó.
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS exam_attempt_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
  question_id INT NOT NULL,
  selected_index INT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE
);

-- ----------------------------------------------------------
-- ÍNDICES (para que las búsquedas sean más rápidas)
-- ----------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_type ON exam_attempts(exam_type);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_registration ON exam_attempts(registration_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempt_answers_attempt ON exam_attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempt_answers_question ON exam_attempt_answers(question_id);

-- ----------------------------------------------------------
-- HABILITAR RLS (Row Level Security)
-- Esto es requerido por Supabase para seguridad.
-- ----------------------------------------------------------
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempt_answers ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------
-- POLÍTICAS DE SEGURIDAD
-- ----------------------------------------------------------

-- Las preguntas del examen son públicas (cualquier visitante puede leerlas)
CREATE POLICY "Cualquier persona puede leer las preguntas"
  ON exam_questions FOR SELECT USING (true);

-- Matrículas: cualquiera puede CREAR una (al inscribirse),
-- pero SOLO la clave de servicio puede LEER y ACTUALIZAR
-- (esto protege los datos personales de los estudiantes)
CREATE POLICY "Cualquier persona puede crear una matrícula"
  ON registrations FOR INSERT WITH CHECK (true);

CREATE POLICY "Solo servicio puede leer matrículas"
  ON registrations FOR SELECT USING (
    auth.role() = 'service_role'
  );

CREATE POLICY "Solo servicio puede actualizar matrículas"
  ON registrations FOR UPDATE USING (
    auth.role() = 'service_role'
  );

-- Intentos de examen: cualquiera puede crear y leer
-- (los resultados no contienen datos sensibles)
CREATE POLICY "Cualquier persona puede crear un intento de examen"
  ON exam_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "Cualquier persona puede leer intentos"
  ON exam_attempts FOR SELECT USING (true);

-- Respuestas de intentos: cualquiera puede crear y leer
CREATE POLICY "Cualquier persona puede guardar respuestas"
  ON exam_attempt_answers FOR INSERT WITH CHECK (true);
CREATE POLICY "Cualquier persona puede leer respuestas"
  ON exam_attempt_answers FOR SELECT USING (true);
