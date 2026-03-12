/**
 * COMPONENTE DE ERROR GLOBAL
 *
 * Se muestra automáticamente cuando algo sale mal en cualquier página.
 * En vez de mostrar un error técnico confuso, muestra un mensaje
 * amigable con opción de reintentar.
 *
 * Nota: Este componente necesita ser 'use client' porque React
 * requiere que los error boundaries sean componentes de cliente.
 */

'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Registrar el error en la consola para depuración
  useEffect(() => {
    console.error('Error en la página:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-ice flex items-center justify-center pt-28 pb-12">
      <div className="container-custom max-w-2xl text-center">
        {/* Ícono de advertencia */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
          <AlertTriangle className="w-10 h-10 text-red-600" />
        </div>

        <h1 className="text-4xl font-bold text-navy mb-4">
          ¡Algo salió mal!
        </h1>
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          Ocurrió un error inesperado. Esto puede ser un problema temporal.
          Intenta recargar la página o regresa al inicio.
        </p>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="btn-primary flex items-center justify-center gap-2 text-lg"
          >
            <RotateCcw className="w-5 h-5" />
            Intentar de Nuevo
          </button>
          <Link
            href="/"
            className="btn-secondary flex items-center justify-center gap-2 text-lg"
          >
            <Home className="w-5 h-5" />
            Ir al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
