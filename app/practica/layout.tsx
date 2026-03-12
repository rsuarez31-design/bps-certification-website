/**
 * Layout para la página de Examen de Práctica.
 * Define los metadatos SEO (título y descripción) de esta página.
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Examen de Práctica | Americas Boating Club - Boqueron Power Squadron',
  description: 'Practica para tu certificación de navegación con 10 preguntas del examen oficial. Gratis y sin registro.',
};

export default function PracticaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
