/**
 * POST /api/admin/drna-report/pdf
 *
 * Genera el PDF del reporte DRNA en landscape a partir del encabezado editable
 * y los estudiantes seleccionados desde el panel admin. No persiste nada.
 */

import { NextRequest, NextResponse } from 'next/server';
import { hasValidAdminSession } from '@/lib/admin-session';
import { generateDrnaReportPdfBytes, type DrnaReportInput, type DrnaStudentRow } from '@/lib/drna-report-pdf';

export const dynamic = 'force-dynamic';

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asBool(value: unknown): boolean {
  return value === true;
}

function normalizeStudent(raw: unknown): DrnaStudentRow {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    apellidos: asString(r.apellidos),
    nombreInicial: asString(r.nombreInicial),
    fechaNacimiento: asString(r.fechaNacimiento),
    direccionFisica: asString(r.direccionFisica),
    direccionPostal: asString(r.direccionPostal),
    firmaEstudiante: asString(r.firmaEstudiante),
    nota: asString(r.nota),
  };
}

export async function POST(request: NextRequest) {
  if (!hasValidAdminSession(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const dias = (body.diasClase ?? {}) as Record<string, unknown>;
    const estudiantesRaw = Array.isArray(body.estudiantes) ? (body.estudiantes as unknown[]) : [];
    if (estudiantesRaw.length === 0) {
      return NextResponse.json({ error: 'Debe seleccionar al menos un estudiante.' }, { status: 400 });
    }

    const input: DrnaReportInput = {
      institucion: asString(body.institucion) || 'BOQUERÓN POWER SQUADRON',
      lugar: asString(body.lugar) || 'Náutico Boquerón',
      fechaCurso: asString(body.fechaCurso),
      fechaExamen: asString(body.fechaExamen),
      fechaConferencia: asString(body.fechaConferencia),
      numeroEstudiantes: asString(body.numeroEstudiantes),
      numeroEstudiantesCompletaron: asString(body.numeroEstudiantesCompletaron),
      personaACargo: asString(body.personaACargo),
      telefonoContacto: asString(body.telefonoContacto),
      horario: asString(body.horario) || '7:00pm a 10:00pm',
      direccionFisicaCurso: asString(body.direccionFisicaCurso),
      pieReporte: asString(body.pieReporte) || 'Boating',
      diasClase: {
        lunes: asBool(dias.lunes),
        martes: asBool(dias.martes),
        miercoles: asBool(dias.miercoles),
        jueves: asBool(dias.jueves),
        viernes: asBool(dias.viernes),
        sabado: asBool(dias.sabado),
        domingo: asBool(dias.domingo),
      },
      estudiantes: estudiantesRaw.map(normalizeStudent),
    };

    const pdfBytes = await generateDrnaReportPdfBytes(input);

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="reporte-drna.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
