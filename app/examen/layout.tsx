/**
 * Layout para la página del Examen Oficial.
 * Define los metadatos SEO (título y descripción) de esta página.
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Examen Oficial de Navegación | Americas Boating Club - Boqueron Power Squadron',
  description: 'Examen oficial de certificación de navegación bajo la Ley 430 de Puerto Rico. 75 preguntas, 80% para aprobar.',
};

export default function ExamenLayout({ children }: { children: React.ReactNode }) {
  return children;
}
