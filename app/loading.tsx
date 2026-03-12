/**
 * COMPONENTE DE CARGA GLOBAL
 *
 * Se muestra automáticamente mientras una página está cargando.
 * Next.js lo usa como "loading state" entre navegaciones.
 * Muestra una animación de ancla para mantener el estilo náutico.
 */

import { Anchor } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-ice flex items-center justify-center">
      <div className="text-center">
        {/* Ícono de ancla con animación de rotación */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-navy/10 rounded-full mb-4 animate-pulse-slow">
          <Anchor className="w-8 h-8 text-navy" />
        </div>
        <p className="text-gray-600 font-semibold">Cargando...</p>
      </div>
    </div>
  );
}
