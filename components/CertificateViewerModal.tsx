'use client';

import { Loader2 } from 'lucide-react';

type Props = {
  open: boolean;
  pdfUrl: string | null;
  loading?: boolean;
  /** Etiqueta del botón para cerrar/volver (estudiante vs admin) */
  homeLabel?: string;
  onDownload: () => void | Promise<void>;
  onPrint: () => void;
  onHome: () => void;
};

export default function CertificateViewerModal({
  open,
  pdfUrl,
  loading,
  homeLabel = 'Volver a la Página Inicial',
  onDownload,
  onPrint,
  onHome,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/70">
      <div className="flex flex-wrap gap-2 justify-center items-center p-3 bg-navy text-white shadow-lg">
        <button
          type="button"
          className="btn-primary text-sm py-2 px-4 disabled:opacity-50"
          disabled={loading || !pdfUrl}
          onClick={() => void onDownload()}
        >
          Grabar
        </button>
        <button
          type="button"
          className="btn-secondary text-sm py-2 px-4 bg-white text-navy border-white hover:bg-gray-100 disabled:opacity-50"
          disabled={loading || !pdfUrl}
          onClick={onPrint}
        >
          Imprimir
        </button>
        <button
          type="button"
          className="btn-secondary text-sm py-2 px-4 border-white text-white hover:bg-white/10"
          onClick={onHome}
        >
          {homeLabel}
        </button>
      </div>
      <div className="flex-1 min-h-0 p-2 bg-gray-900">
        {loading && (
          <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-white gap-3">
            <Loader2 className="w-10 h-10 animate-spin" aria-hidden />
            <p className="text-sm font-medium">Generando certificado...</p>
          </div>
        )}
        {!loading && pdfUrl ? (
          <iframe
            title="Certificado oficial"
            src={`${pdfUrl}#toolbar=0`}
            className="w-full h-full min-h-[75vh] rounded bg-white border-0"
          />
        ) : null}
      </div>
    </div>
  );
}
