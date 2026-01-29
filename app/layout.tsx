/**
 * LAYOUT PRINCIPAL DE LA APLICACIÓN
 * 
 * Este es el layout raíz que envuelve todas las páginas de la aplicación.
 * Define la estructura HTML básica, metadatos y componentes compartidos como
 * la navegación y el footer.
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

/**
 * Configuración de la fuente Inter de Google Fonts
 * Inter es una fuente moderna y legible, ideal para interfaces web
 */
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Mejora el rendimiento mostrando texto mientras carga la fuente
});

/**
 * METADATOS DE LA APLICACIÓN
 * 
 * Estos metadatos son importantes para:
 * - SEO (optimización para motores de búsqueda)
 * - Redes sociales (cómo se ve cuando se comparte el link)
 * - Navegadores (título de la pestaña, favicon, etc.)
 */
export const metadata: Metadata = {
  title: 'Americas Boating Club - Boqueron Power Squadron | Certificación Ley 430 PR',
  description: 'Sistema de certificación oficial de navegación según la Ley 430 de Puerto Rico. Curso completo, examen en línea y certificado digital.',
  keywords: 'navegación, Puerto Rico, Ley 430, certificación náutica, Americas Boating Club, Boqueron, curso de navegación',
  authors: [{ name: 'Americas Boating Club - Boqueron Power Squadron' }],
  openGraph: {
    title: 'Certificación Oficial de Navegación Ley 430 PR',
    description: 'Obtén tu certificación oficial de navegación en Puerto Rico',
    type: 'website',
    locale: 'es_PR',
  },
};

/**
 * COMPONENTE RAÍZ DEL LAYOUT
 * 
 * Este componente envuelve todo el contenido de la aplicación.
 * Todos los componentes de página se renderizan dentro de {children}.
 * 
 * @param children - Contenido de la página actual
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth">
      {/* 
        lang="es": Define el idioma como español (importante para accesibilidad y SEO)
        scroll-smooth: Hace que el scroll sea suave al navegar con anclas
      */}
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        {/*
          flex flex-col: Dispone los elementos en columna (uno debajo del otro)
          min-h-screen: Altura mínima de toda la pantalla (para que el footer quede abajo)
        */}
        
        {/* Barra de navegación superior - aparece en todas las páginas */}
        <Navbar />
        
        {/* 
          Contenido principal de la página
          flex-1: Ocupa todo el espacio disponible entre navbar y footer
        */}
        <main className="flex-1">
          {children}
        </main>
        
        {/* Footer (pie de página) - aparece en todas las páginas */}
        <Footer />
      </body>
    </html>
  );
}
