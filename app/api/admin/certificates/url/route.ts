/**
 * POST /api/admin/certificates/url
 * Devuelve URL firmada del certificado para un intento oficial (panel admin).
 */

import { NextRequest, NextResponse } from 'next/server';
import { hasValidAdminSession } from '@/lib/admin-session';
import { getOrCreateCertificateSignedUrl } from '@/lib/certificate-storage';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!hasValidAdminSession(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const attemptId = String(body.attemptId || '');
    if (!attemptId) {
      return NextResponse.json({ error: 'attemptId requerido' }, { status: 400 });
    }

    const result = await getOrCreateCertificateSignedUrl({ attemptId });

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
