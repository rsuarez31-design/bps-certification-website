/**
 * PÁGINA DE PAGO EXITOSO
 *
 * Esta página se muestra después de que el estudiante
 * completa el pago en Stripe exitosamente.
 * Le da un resumen claro y los próximos pasos.
 */

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, BookOpen, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { Suspense } from 'react';

/**
 * Componente interno que usa useSearchParams.
 * Necesita estar envuelto en <Suspense> porque useSearchParams
 * requiere un "suspense boundary" en Next.js.
 */
function PagoExitosoContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [animado, setAnimado] = useState(false);

  // Activar la animación de entrada después de que se cargue la página
  useEffect(() => {
    const timer = setTimeout(() => setAnimado(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-ice pt-28 pb-12">
      <div className="container-custom max-w-3xl">
        {/* Tarjeta principal de confirmación */}
        <div className={`card text-center transition-all duration-700 ${animado ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Ícono de éxito con animación */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
            <CheckCircle2 className="w-14 h-14 text-green-600" />
          </div>

          <h1 className="text-4xl font-bold text-navy mb-4">
            ¡Pago Exitoso!
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Tu inscripción al curso de Certificación de Navegación
            Ley 430 ha sido confirmada. ¡Bienvenido a bordo!
          </p>

          {/* Resumen del pago */}
          {sessionId && (
            <div className="bg-ice rounded-lg p-4 mb-8 inline-block">
              <p className="text-sm text-gray-500">
                Confirmación: <span className="font-mono text-gray-700">{sessionId.slice(0, 20)}...</span>
              </p>
            </div>
          )}
        </div>

        {/* Próximos pasos */}
        <div className={`mt-8 transition-all duration-700 delay-300 ${animado ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="text-2xl font-bold text-navy mb-6 text-center">
            Próximos Pasos
          </h2>

          <div className="space-y-4">
            {/* Paso 1 */}
            <div className="card flex items-start gap-4">
              <div className="w-10 h-10 bg-navy rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">1</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-navy mb-1">Estudia el Material</h3>
                <p className="text-gray-600">
                  Revisa el libro de texto y los materiales del curso para prepararte para el examen.
                </p>
              </div>
            </div>

            {/* Paso 2 */}
            <div className="card flex items-start gap-4">
              <div className="w-10 h-10 bg-navy rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">2</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-navy mb-1">Practica con el Examen</h3>
                <p className="text-gray-600">
                  Toma el examen de práctica las veces que necesites para familiarizarte con las preguntas.
                </p>
              </div>
            </div>

            {/* Paso 3 */}
            <div className="card flex items-start gap-4">
              <div className="w-10 h-10 bg-navy rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">3</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-navy mb-1">Toma el Examen Oficial</h3>
                <p className="text-gray-600">
                  Cuando te sientas listo, toma el examen oficial. Necesitas 80% o más para aprobar.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className={`mt-8 flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-500 ${animado ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Link
            href="/practica"
            className="btn-primary flex items-center justify-center gap-2 text-lg px-8 py-4"
          >
            <BookOpen className="w-5 h-5" />
            Examen de Práctica
          </Link>
          <Link
            href="/examen"
            className="btn-secondary flex items-center justify-center gap-2 text-lg px-8 py-4"
          >
            <FileText className="w-5 h-5" />
            Examen Oficial
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Página principal envuelta en Suspense.
 * Esto es necesario porque useSearchParams necesita un "suspense boundary".
 */
export default function PagoExitosoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ice flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-navy animate-spin" />
        </div>
      }
    >
      <PagoExitosoContent />
    </Suspense>
  );
}
