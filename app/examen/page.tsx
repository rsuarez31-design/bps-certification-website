/**
 * Página del examen oficial: verifica visibilidad y delega en el cliente.
 */

import { redirect } from 'next/navigation';
import { getSiteVisibilityFlags } from '@/lib/site-config-public';
import ExamenPageClient from './ExamenPageClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ExamenPage() {
  const { officialExamEnabled } = await getSiteVisibilityFlags();
  if (!officialExamEnabled) {
    redirect('/');
  }
  return <ExamenPageClient />;
}
