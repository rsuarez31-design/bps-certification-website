/**
 * Cliente: pago exitoso (Stripe). Recibe si el examen oficial está visible públicamente.
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, BookOpen, FileText, ArrowRight, Loader2 } from 'lucide-react';

function PagoExitosoContent({ officialExamEnabled }: { officialExamEnabled: boolean }) {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [animado, setAnimado] = useState(false);
  const [syncEstado, setSyncEstado] = useState<'idle' | 'syncing' | 'ok' | 'error'>('idle');

  useEffect(() => {
    const timer = setTimeout(() => setAnimado(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!sessionId || !sessionId.startsWith('cs_')) return;
    let cancelado = false;
    setSyncEstado('syncing');
    (async () => {
      try {
        const res = await fetch('/api/stripe/confirm-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        if (cancelado) return;
        if (res.ok && data.success) {
          setSyncEstado('ok');
        } else if (data.error) {
          setSyncEstado('error');
          console.warn('No se pudo sincronizar el pago con el panel:', data.error);
        } else {
          setSyncEstado('idle');
        }
      } catch {
        if (!cancelado) setSyncEstado('error');
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-ice pt-28 pb-12">
      <div className="container-custom max-w-3xl">
        <div className={`card text-center transition-all duration-700 ${animado ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
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

          {sessionId && (
            <div className="bg-ice rounded-lg p-4 mb-8 inline-block text-left max-w-md mx-auto">
              <p className="text-sm text-gray-500">
                Confirmación: <span className="font-mono text-gray-700">{sessionId.slice(0, 20)}...</span>
              </p>
              {syncEstado === 'syncing' && (
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-2 justify-center">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Sincronizando tu inscripción con el sistema…
                </p>
              )}
              {syncEstado === 'ok' && (
                <p className="text-xs text-maritime-green mt-2 font-medium">
                  Tu matrícula quedó registrada como pagada en el panel administrativo.
                </p>
              )}
              {syncEstado === 'error' && (
                <p className="text-xs text-amber-700 mt-2">
                  Si no ves el pago en el panel, revisa el webhook en Stripe o pulsa &quot;Actualizar Datos&quot; más tarde.
                </p>
              )}
            </div>
          )}
        </div>

        <div className={`mt-8 transition-all duration-700 delay-300 ${animado ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="text-2xl font-bold text-navy mb-6 text-center">
            Próximos Pasos
          </h2>

          <div className="space-y-4">
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

            {officialExamEnabled && (
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
            )}
          </div>
        </div>

        <div className={`mt-8 flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-500 ${animado ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Link
            href="/practica"
            className="btn-primary flex items-center justify-center gap-2 text-lg px-8 py-4"
          >
            <BookOpen className="w-5 h-5" />
            Examen de Práctica
          </Link>
          {officialExamEnabled && (
            <Link
              href="/examen"
              className="btn-secondary flex items-center justify-center gap-2 text-lg px-8 py-4"
            >
              <FileText className="w-5 h-5" />
              Examen Oficial
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PagoExitosoClient({ officialExamEnabled }: { officialExamEnabled: boolean }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ice flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-navy animate-spin" />
        </div>
      }
    >
      <PagoExitosoContent officialExamEnabled={officialExamEnabled} />
    </Suspense>
  );
}
