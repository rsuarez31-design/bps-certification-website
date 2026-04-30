/**
 * GET /api/admin/certificates/preview
 * PDF de muestra (no persistido): nombre "Juan Del Pueblo", fecha 01/01/2026.
 */

import { NextRequest, NextResponse } from 'next/server';
import { hasValidAdminSession } from '@/lib/admin-session';
import { generateOfficialCertificatePdfBytes } from '@/lib/certificate-pdf';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!hasValidAdminSession(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const pdfBytes = await generateOfficialCertificatePdfBytes({
      recipientLine: 'Juan Del Pueblo',
      examDateDdMmYyyy: '01/01/2026',
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="certificado-preview.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
