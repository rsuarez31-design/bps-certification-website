/**
 * RUTA API: Actualizar número de rastreo (tracking number) de una matrícula.
 * Solo se usa desde el panel administrativo.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { registrationId, trackingNumber } = body;

    if (!registrationId) {
      return NextResponse.json({ error: 'Se requiere registrationId' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('registrations')
      .update({ tracking_number: trackingNumber || '' })
      .eq('id', registrationId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
