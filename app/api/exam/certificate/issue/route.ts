/**
 * POST /api/exam/certificate/issue
 * Emite (si falta) el PDF del certificado y devuelve URL firmada.
 * Requiere attemptId + email que coincida con el intento.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateCertificateSignedUrl } from '@/lib/certificate-storage';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const attemptId = String(body.attemptId || '');
    const email = String(body.email || '').trim().toLowerCase();

    if (!attemptId || !email) {
      return NextResponse.json({ error: 'attemptId y email son requeridos.' }, { status: 400 });
    }

    const result = await getOrCreateCertificateSignedUrl({
      attemptId,
      verifyStudentEmail: email,
    });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      success: true,
      signedUrl: result.signedUrl,
      expiresIn: 3600,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
