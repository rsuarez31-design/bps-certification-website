/**
 * RUTA API: Validar acceso al examen oficial.
 *
 * Verifica que el estudiante:
 * 1. Tenga una matrícula pagada
 * 2. Esté dentro de las 24 horas después del pago
 * 3. No haya excedido los 3 intentos permitidos
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.trim()) {
      return NextResponse.json({ allowed: false, reason: 'Se requiere un email válido.' });
    }

    // Buscar matrícula pagada con este email
    const { data: registration, error: regError } = await supabaseAdmin
      .from('registrations')
      .select('id, created_at, email')
      .eq('email', email.trim().toLowerCase())
      .eq('payment_status', 'paid')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (regError || !registration) {
      return NextResponse.json({
        allowed: false,
        reason: 'No se encontró una matrícula pagada con este email.',
      });
    }

    // Verificar que esté dentro de las 24 horas
    const matriculaDate = new Date(registration.created_at);
    const ahora = new Date();
    const horasTranscurridas = (ahora.getTime() - matriculaDate.getTime()) / (1000 * 60 * 60);

    if (horasTranscurridas > 24) {
      return NextResponse.json({
        allowed: false,
        reason: 'Tu periodo de 24 horas para tomar el examen ha expirado. Contacta al administrador.',
      });
    }

    // Contar intentos oficiales del estudiante en las últimas 24 horas
    const hace24h = new Date(ahora.getTime() - 24 * 60 * 60 * 1000).toISOString();

    const { count, error: countError } = await supabaseAdmin
      .from('exam_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('student_email', email.trim().toLowerCase())
      .eq('exam_type', 'oficial')
      .gte('created_at', hace24h);

    const intentosUsados = count || 0;

    if (intentosUsados >= 3) {
      return NextResponse.json({
        allowed: false,
        reason: 'Has alcanzado el máximo de 3 intentos permitidos.',
      });
    }

    return NextResponse.json({
      allowed: true,
      attemptsUsed: intentosUsados,
      registrationId: registration.id,
    });
  } catch (err: any) {
    return NextResponse.json({ allowed: false, reason: 'Error del servidor: ' + err.message });
  }
}
