/**
 * CARGADOR DE PREGUNTAS (Supabase con respaldo local)
 *
 * Este archivo intenta cargar las preguntas del examen desde Supabase.
 * Si Supabase no está disponible o falla, usa el archivo local como respaldo.
 * Así el examen siempre funciona, con o sin base de datos.
 */

import { examQuestions, ExamQuestion } from '@/data/examQuestions';
import { supabase } from '@/lib/supabase-client';

/**
 * Convierte una pregunta del formato de Supabase al formato del examen.
 * En Supabase las opciones están en columnas separadas (option_a, option_b...),
 * pero en el examen necesitamos un arreglo de opciones.
 */
function convertirPreguntaSupabase(row: any): ExamQuestion {
  return {
    id: row.id,
    question: row.question,
    options: [row.option_a, row.option_b, row.option_c, row.option_d],
    correctAnswer: row.correct_index,
    hint: row.hint || '',
  };
}

/**
 * Carga todas las preguntas del examen.
 * Primero intenta desde Supabase; si falla, usa el archivo local.
 *
 * @returns Array con todas las preguntas del examen
 */
export async function cargarPreguntas(): Promise<ExamQuestion[]> {
  try {
    const { data, error } = await supabase
      .from('exam_questions')
      .select('*')
      .order('id', { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn(
        'No se pudieron cargar preguntas de Supabase, usando archivo local.',
        error?.message
      );
      return examQuestions;
    }

    return data.map(convertirPreguntaSupabase);
  } catch (err) {
    console.warn('Error al conectar con Supabase, usando archivo local:', err);
    return examQuestions;
  }
}

/**
 * Mezcla las preguntas aleatoriamente y devuelve la cantidad solicitada.
 * Usa el algoritmo de Fisher-Yates (el método más justo de aleatorización).
 *
 * @param preguntas - Array de preguntas para mezclar
 * @param cantidad - Cuántas preguntas devolver (ej: 75 para oficial, 10 para práctica)
 * @returns Array con las preguntas mezcladas
 */
export function mezclarPreguntas(preguntas: ExamQuestion[], cantidad: number): ExamQuestion[] {
  const mezcladas = [...preguntas];

  for (let i = mezcladas.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [mezcladas[i], mezcladas[j]] = [mezcladas[j], mezcladas[i]];
  }

  return mezcladas.slice(0, cantidad);
}
