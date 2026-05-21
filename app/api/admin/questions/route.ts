/**
 * RUTA API: Banco de Preguntas (listado para el panel administrativo)
 *
 * GET /api/admin/questions
 * Retorna todas las preguntas del examen ordenadas por id, incluyendo
 * el campo image_url para que el panel pueda mostrar la miniatura.
 *
 * Esta ruta se usa unicamente desde el panel administrativo. Sigue el
 * patron de las demas rutas /api/admin/* y usa supabaseAdmin (service_role).
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('exam_questions')
      .select('id, question, option_a, option_b, option_c, option_d, correct_index, hint, image_url')
      .order('id', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { questions: data || [] },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
