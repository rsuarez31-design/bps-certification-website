/**
 * Layout para el Panel Administrativo.
 * Define los metadatos SEO y evita que los buscadores indexen esta página.
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panel Administrativo | BPS',
  description: 'Panel de administración del sistema de certificación de navegación.',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
