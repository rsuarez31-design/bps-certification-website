/**
 * CLIENTE DE SUPABASE (para el navegador)
 *
 * Este archivo crea la conexión a Supabase que se usa
 * desde las páginas del sitio web (en el navegador del estudiante).
 * Usa la clave "anon" que es segura para el público.
 *
 * Nota: Esta clave solo permite operaciones que las
 * políticas de seguridad (RLS) de Supabase permitan.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Variables públicas (NEXT_PUBLIC_ = visibles en el navegador)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Crear el cliente de Supabase.
 * Si las variables de entorno no están configuradas, usamos un
 * placeholder para evitar errores durante la compilación (build).
 */
export const supabase: SupabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');
