/**
 * RUTA API: Leer y actualizar la configuración del curso (mes y año).
 * GET  -> devuelve la configuración actual
 * PUT  -> actualiza mes y año del curso
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('site_config')
      .select('course_month, course_year')
      .eq('id', 'default')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { course_month, course_year } = body;

    if (!course_month || !course_year) {
      return NextResponse.json({ error: 'Se requiere course_month y course_year' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('site_config')
      .update({
        course_month,
        course_year,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 'default');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
