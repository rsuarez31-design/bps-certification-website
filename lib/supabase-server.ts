/**
 * CLIENTE DE SUPABASE (para el servidor)
 *
 * Este archivo crea una conexión a Supabase que se usa
 * desde las rutas de API (servidor). Usa la clave de servicio
 * que tiene acceso completo a la base de datos.
 *
 * IMPORTANTE: esta clave NUNCA debe llegar al navegador.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Variables del servidor (sin NEXT_PUBLIC_ = solo el servidor las ve)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Crear el cliente de Supabase de forma segura.
 * Si las variables de entorno no están configuradas, usamos un placeholder
 * para evitar errores durante la compilación (build).
 */
export const supabaseAdmin: SupabaseClient = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');
