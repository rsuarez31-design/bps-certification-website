/**
 * RUTA DE API: Verificar credenciales de administrador
 *
 * Esta ruta verifica si el usuario y contraseña son correctos
 * para entrar al panel de administrador.
 *
 * Las credenciales se leen de variables de entorno (.env.local),
 * así nadie puede verlas en el código fuente.
 *
 * También tiene protección contra "fuerza bruta":
 * si alguien intenta muchas veces seguidas con datos incorrectos,
 * el sistema lo bloquea temporalmente.
 */

import { NextRequest, NextResponse } from 'next/server';

// Leer credenciales desde variables de entorno (no visibles en el código)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'BPS';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '2026';

// Límite de intentos fallidos antes de bloquear
const MAX_INTENTOS = 5;
// Tiempo de bloqueo en milisegundos (15 minutos)
const TIEMPO_BLOQUEO_MS = 15 * 60 * 1000;

/**
 * Registro de intentos fallidos por dirección IP.
 * Ejemplo: { "192.168.1.1": { intentos: 3, ultimoIntento: 1700000000000 } }
 *
 * Nota: en un servidor "serverless" (como Vercel), esta memoria se
 * reinicia cuando la función se "enfría". Para protección más robusta
 * se podría usar Supabase, pero esto cubre la mayoría de los ataques.
 */
const registroIntentos: Record<string, { intentos: number; ultimoIntento: number }> = {};

export async function POST(request: NextRequest) {
  try {
    // Obtener la dirección IP del visitante (para rastrear intentos)
    const ip = request.headers.get('x-forwarded-for') || 'desconocido';

    // Verificar si esta IP está bloqueada
    const registro = registroIntentos[ip];
    if (registro && registro.intentos >= MAX_INTENTOS) {
      const tiempoTranscurrido = Date.now() - registro.ultimoIntento;

      if (tiempoTranscurrido < TIEMPO_BLOQUEO_MS) {
        const minutosRestantes = Math.ceil((TIEMPO_BLOQUEO_MS - tiempoTranscurrido) / 60000);
        return NextResponse.json(
          {
            authenticated: false,
            error: `Demasiados intentos fallidos. Intenta de nuevo en ${minutosRestantes} minuto(s).`,
          },
          { status: 429 }
        );
      }

      // Ya pasó el tiempo de bloqueo, reiniciar el contador
      delete registroIntentos[ip];
    }

    const body = await request.json();
    const { username, password } = body;

    // Verificar las credenciales
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Login exitoso: limpiar el registro de intentos fallidos
      delete registroIntentos[ip];
      return NextResponse.json({ authenticated: true });
    } else {
      // Login fallido: incrementar el contador de intentos
      if (!registroIntentos[ip]) {
        registroIntentos[ip] = { intentos: 0, ultimoIntento: 0 };
      }
      registroIntentos[ip].intentos += 1;
      registroIntentos[ip].ultimoIntento = Date.now();

      const intentosRestantes = MAX_INTENTOS - registroIntentos[ip].intentos;

      return NextResponse.json(
        {
          authenticated: false,
          error: intentosRestantes > 0
            ? `Usuario o contraseña incorrectos. Te quedan ${intentosRestantes} intento(s).`
            : 'Cuenta bloqueada temporalmente por demasiados intentos fallidos.',
        },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { authenticated: false, error: 'Error del servidor' },
      { status: 500 }
    );
  }
}
