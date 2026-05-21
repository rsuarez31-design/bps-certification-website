/**
 * POST /api/exam/documentos-bps/url
 * Devuelve URL firmada (1 h) del zip "Documentos BPS" para un intento oficial aprobado.
 *
 * No requiere autenticación de admin; valida que el attemptId corresponde a un
 * intento `oficial` con `passed = true` antes de entregar el enlace.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDocumentosBpsSignedUrlForAttempt } from '@/lib/documentos-bps-storage';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const attemptId = String(body?.attemptId || '');

    if (!attemptId) {
      return NextResponse.json({ error: 'attemptId es requerido.' }, { status: 400 });
    }

    const result = await getDocumentosBpsSignedUrlForAttempt({ attemptId });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      success: true,
      signedUrl: result.signedUrl,
      expiresIn: result.expiresIn,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('documentos-bps url: error inesperado', e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
