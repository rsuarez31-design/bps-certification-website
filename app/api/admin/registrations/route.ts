/**
 * RUTA API: Lectura segura de matrículas para el panel administrativo.
 * Usa supabaseAdmin (service_role) para poder leer datos protegidos.
 *
 * Query params opcionales:
 *   ?filter=paid|pending|all
 *   &month=Enero
 *   &year=2026
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'paid';
    const month = searchParams.get('month') || '';
    const year = searchParams.get('year') || '';

    let query = supabaseAdmin
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });

    // Filtro de estado de pago
    if (filter === 'paid') {
      query = query.eq('payment_status', 'paid');
    } else if (filter === 'pending') {
      query = query.eq('payment_status', 'pending');
    }

    // Filtro por mes y año (busca dentro del campo course_name)
    if (month && month !== 'Todos') {
      query = query.ilike('course_name', `%${month}%`);
    }
    if (year && year !== 'Todos') {
      query = query.ilike('course_name', `%${year}%`);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Para cada registro que tenga un documento de ID, generar URL firmada
    const registrosConUrls = await Promise.all(
      (data || []).map(async (reg) => {
        let idDocumentUrl = null;
        if (reg.id_document_path) {
          const { data: signedData } = await supabaseAdmin.storage
            .from('id-documents')
            .createSignedUrl(reg.id_document_path, 3600);
          idDocumentUrl = signedData?.signedUrl || null;
        }
        return { ...reg, id_document_url: idDocumentUrl };
      })
    );

    return NextResponse.json({ registrations: registrosConUrls });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
