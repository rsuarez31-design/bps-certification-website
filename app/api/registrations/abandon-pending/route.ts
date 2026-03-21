/**
 * RUTA API: Descartar matrícula pendiente (pago no completado)
 *
 * Se llama desde /matricula cuando el usuario vuelve de Stripe sin pagar.
 * Solo borra si payment_status sigue siendo "pending".
 */

import { NextRequest, NextResponse } from 'next/server';
import { eliminarMatriculaSiPendiente } from '@/lib/eliminar-matricula-pendiente';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const registrationId = body.registrationId as string | undefined;
    if (!registrationId) {
      return NextResponse.json({ error: 'Falta registrationId' }, { status: 400 });
    }

    const result = await eliminarMatriculaSiPendiente(registrationId);
    if (result.ok) {
      return NextResponse.json({ success: true });
    }
    if (result.reason === 'id_invalido') {
      return NextResponse.json({ error: 'ID no válido' }, { status: 400 });
    }
    // Ya pagada, no existe, etc.: respuesta tranquila para el navegador (idempotente)
    if (
      result.reason === 'ya_no_es_pendiente' ||
      result.reason === 'no_encontrada'
    ) {
      return NextResponse.json({ success: true, skipped: true });
    }
    return NextResponse.json(
      { error: result.reason || 'No se pudo eliminar' },
      { status: 500 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
