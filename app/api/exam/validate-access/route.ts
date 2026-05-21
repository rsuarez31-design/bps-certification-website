/**
 * RUTA API: Validar acceso al examen oficial.
 *
 * Verifica ventana global, matrícula pagada del curso corriente,
 * nombre, apellido, email e intentos dentro de la ventana.
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateOfficialExamAccess } from '@/lib/exam-official-access';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email ?? '');
    const firstName = String(body.firstName ?? '');
    const lastName = String(body.lastName ?? '');

    const access = await validateOfficialExamAccess({ email, firstName, lastName });

    if (!access.ok) {
      return NextResponse.json({ allowed: false, reason: access.reason });
    }

    return NextResponse.json({
      allowed: true,
      attemptsUsed: access.attemptsUsed,
      registrationId: access.registration.id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ allowed: false, reason: 'Error del servidor: ' + message });
  }
}
