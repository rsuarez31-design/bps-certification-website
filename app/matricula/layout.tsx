/**
 * Layout para la página de Matrícula.
 * Define los metadatos SEO (título y descripción) de esta página.
 * Esto ayuda a que Google y otros buscadores muestren la
 * información correcta cuando alguien busca esta página.
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Matrícula Digital | Americas Boating Club - Boqueron Power Squadron',
  description: 'Inscríbete en el curso de certificación de navegación bajo la Ley 430 de Puerto Rico. Pago seguro con Stripe.',
};

export default function MatriculaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
