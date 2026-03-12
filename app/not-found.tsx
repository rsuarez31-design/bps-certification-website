/**
 * PÁGINA 404 - NO ENCONTRADA
 *
 * Esta página se muestra cuando alguien visita una URL
 * que no existe en el sitio web.
 * Tiene el mismo estilo náutico que el resto del sitio.
 */

import Link from 'next/link';
import { Anchor, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ice flex items-center justify-center pt-28 pb-12">
      <div className="container-custom max-w-2xl text-center">
        {/* Ícono grande de ancla */}
        <div className="inline-flex items-center justify-center w-24 h-24 bg-navy/10 rounded-full mb-8">
          <Anchor className="w-12 h-12 text-navy" />
        </div>

        {/* Número 404 grande */}
        <h1 className="text-8xl font-bold text-navy mb-4">404</h1>

        {/* Mensaje amigable */}
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          ¡Navegante perdido!
        </h2>
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          Parece que esta página se fue a la deriva. La URL que buscas
          no existe o fue movida a otro puerto.
        </p>

        {/* Botones para regresar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="btn-primary flex items-center justify-center gap-2 text-lg"
          >
            <Home className="w-5 h-5" />
            Ir al Inicio
          </Link>
          <Link
            href="/matricula"
            className="btn-secondary flex items-center justify-center gap-2 text-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Inscríbete Ahora
          </Link>
        </div>
      </div>
    </div>
  );
}
