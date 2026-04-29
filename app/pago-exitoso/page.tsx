/**
 * PAGO EXITOSO — servidor pasa visibilidad del examen oficial al cliente.
 */

import { getSiteVisibilityFlags } from '@/lib/site-config-public';
import PagoExitosoClient from './PagoExitosoClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PagoExitosoPage() {
  const { officialExamEnabled } = await getSiteVisibilityFlags();
  return <PagoExitosoClient officialExamEnabled={officialExamEnabled} />;
}
