/**
 * RUTA API: Lectura de matrículas pagadas para el panel administrativo.
 * Solo devuelve registros con pago confirmado (no borradores ni cancelados).
 *
 * Query params opcionales:
 *   &month=Enero
 *   &year=2026
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || '';
    const year = searchParams.get('year') || '';

    let query = supabaseAdmin
      .from('registrations')
      .select('*')
      .in('payment_status', ['paid', 'Paid'])
      .order('created_at', { ascending: false });

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

    const registrosConUrls = await Promise.all(
      (data || []).map(async (reg) => {
        let idDocumentUrl = null;
        if (reg.id_document_path) {
          try {
            const { data: signedData, error: signErr } = await supabaseAdmin.storage
              .from('id-documents')
              .createSignedUrl(reg.id_document_path, 3600);
            if (signErr) {
              console.warn('Signed URL ID:', reg.id, signErr.message);
            } else {
              idDocumentUrl = signedData?.signedUrl || null;
            }
          } catch (e: any) {
            console.warn('Signed URL ID excepción:', reg.id, e?.message);
          }
        }
        return { ...reg, id_document_url: idDocumentUrl };
      })
    );

    return NextResponse.json({ registrations: registrosConUrls });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
