/**
 * Página de matrícula: verifica visibilidad y delega en el cliente.
 */

import { redirect } from 'next/navigation';
import { getSiteVisibilityFlags } from '@/lib/site-config-public';
import MatriculaPageClient from './MatriculaPageClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MatriculaPage() {
  const { enrollmentEnabled } = await getSiteVisibilityFlags();
  if (!enrollmentEnabled) {
    redirect('/');
  }
  return <MatriculaPageClient />;
}
