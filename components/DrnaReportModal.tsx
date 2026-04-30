'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, X, Save, Printer, FileText } from 'lucide-react';

export type DrnaModalRegistration = {
  id: string;
  full_name: string;
  last_name: string;
  birth_date: string;
  physical_address: string;
  postal_address: string;
  city: string;
  zip_code: string;
};

export type DrnaModalExamAttempt = {
  id: string;
  registration_id: string | null;
  percentage: number;
  passed: boolean;
  created_at: string;
};

type DiasClase = {
  lunes: boolean;
  martes: boolean;
  miercoles: boolean;
  jueves: boolean;
  viernes: boolean;
  sabado: boolean;
  domingo: boolean;
};

type Props = {
  open: boolean;
  filterMonth: string;
  filterYear: string;
  registrations: DrnaModalRegistration[];
  examAttempts: DrnaModalExamAttempt[];
  onClose: () => void;
};

const DEFAULT_DIAS: DiasClase = {
  lunes: true,
  martes: true,
  miercoles: true,
  jueves: true,
  viernes: false,
  sabado: false,
  domingo: false,
};

function formatBirthDate(value: string): string {
  if (!value) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return value;
}

function buildPhysicalAddress(reg: DrnaModalRegistration): string {
  const parts = [reg.physical_address, reg.city, reg.zip_code].map((p) => (p || '').trim()).filter(Boolean);
  return parts.join(', ');
}

function buildPostalAddress(reg: DrnaModalRegistration): string {
  return (reg.postal_address || '').trim();
}

function bestPercentageFor(regId: string, attempts: DrnaModalExamAttempt[]): { nota: string; latestAt: string | null } {
  const matches = attempts.filter((a) => a.registration_id === regId);
  // Si el estudiante aún no ha completado el examen, mostrar 0% (no vacío).
  if (matches.length === 0) return { nota: '0%', latestAt: null };
  const best = matches.reduce((acc, cur) => (cur.percentage > acc.percentage ? cur : acc), matches[0]);
  const latest = matches.reduce((acc, cur) => (new Date(cur.created_at) > new Date(acc.created_at) ? cur : acc), matches[0]);
  return { nota: `${Math.round(best.percentage)}%`, latestAt: latest.created_at };
}

export default function DrnaReportModal({
  open,
  filterMonth,
  filterYear,
  registrations,
  examAttempts,
  onClose,
}: Props) {
  const [institucion, setInstitucion] = useState('BOQUERÓN POWER SQUADRON');
  const [lugar, setLugar] = useState('Náutico Boquerón');
  const [fechaCurso, setFechaCurso] = useState('');
  const [fechaExamen, setFechaExamen] = useState('');
  const [fechaConferencia, setFechaConferencia] = useState('');
  const [horario, setHorario] = useState('7:00pm a 10:00pm');
  const [direccionFisicaCurso, setDireccionFisicaCurso] = useState('Náutico de Boquerón, Calle De Diego, Boquerón, PR');
  const [personaACargo, setPersonaACargo] = useState('');
  const [telefonoContacto, setTelefonoContacto] = useState('787-838-5232');
  const [diasClase, setDiasClase] = useState<DiasClase>(DEFAULT_DIAS);
  const [pieReporte, setPieReporte] = useState('Boating');

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset selection / urls when modal opens or registrations change.
  useEffect(() => {
    if (!open) return;
    const next: Record<string, boolean> = {};
    registrations.forEach((r) => {
      next[r.id] = true;
    });
    setSelected(next);
    setPdfUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setErrorMsg(null);
  }, [open, registrations]);

  // Pre-cargar fecha de curso a partir del filtro mes/año.
  useEffect(() => {
    if (!open) return;
    if (filterMonth !== 'Todos' && filterYear !== 'Todos') {
      setFechaCurso((current) => current || `${filterMonth} ${filterYear}`);
    }
  }, [open, filterMonth, filterYear]);

  // Pre-cargar fecha de examen con la fecha más reciente entre intentos seleccionados.
  useEffect(() => {
    if (!open) return;
    const selectedIds = registrations.filter((r) => selected[r.id]).map((r) => r.id);
    let latest: Date | null = null;
    for (const id of selectedIds) {
      const { latestAt } = bestPercentageFor(id, examAttempts);
      if (latestAt) {
        const d = new Date(latestAt);
        if (!latest || d > latest) latest = d;
      }
    }
    if (latest) {
      const dd = String(latest.getDate()).padStart(2, '0');
      const mm = String(latest.getMonth() + 1).padStart(2, '0');
      const yyyy = latest.getFullYear();
      setFechaExamen((current) => current || `${dd}/${mm}/${yyyy}`);
    }
  }, [open, registrations, selected, examAttempts]);

  // Liberar URL al cerrar/desmontar.
  useEffect(() => {
    return () => {
      setPdfUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, []);

  const allSelected = useMemo(
    () => registrations.length > 0 && registrations.every((r) => selected[r.id]),
    [registrations, selected],
  );
  const someSelected = useMemo(() => registrations.some((r) => selected[r.id]), [registrations, selected]);
  const selectedCount = useMemo(() => registrations.filter((r) => selected[r.id]).length, [registrations, selected]);
  const completedCount = useMemo(
    () =>
      registrations.filter((r) => {
        if (!selected[r.id]) return false;
        const attempts = examAttempts.filter((a) => a.registration_id === r.id);
        return attempts.some((a) => a.passed);
      }).length,
    [registrations, selected, examAttempts],
  );

  const toggleAll = (checked: boolean) => {
    const next: Record<string, boolean> = {};
    registrations.forEach((r) => {
      next[r.id] = checked;
    });
    setSelected(next);
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const buildPayload = () => {
    const filtered = registrations.filter((r) => selected[r.id]);
    return {
      institucion,
      lugar,
      fechaCurso,
      fechaExamen,
      fechaConferencia,
      horario,
      direccionFisicaCurso,
      personaACargo,
      telefonoContacto,
      pieReporte,
      diasClase,
      numeroEstudiantes: String(registrations.length),
      numeroEstudiantesCompletaron: String(completedCount),
      estudiantes: filtered.map((r) => {
        const { nota } = bestPercentageFor(r.id, examAttempts);
        const firstNameInitial = (r.full_name || '').trim().split(/\s+/)[0] || '';
        return {
          apellidos: (r.last_name || '').trim(),
          nombreInicial: firstNameInitial,
          fechaNacimiento: formatBirthDate(r.birth_date),
          direccionFisica: buildPhysicalAddress(r),
          direccionPostal: buildPostalAddress(r),
          firmaEstudiante: `${(r.full_name || '').trim()} ${(r.last_name || '').trim()}`.trim(),
          nota,
        };
      }),
    };
  };

  const generatePdf = async (): Promise<string | null> => {
    if (!someSelected) {
      setErrorMsg('Selecciona al menos un estudiante para generar el reporte.');
      return null;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/drna-report/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = (data as { error?: string })?.error || `Error ${res.status}`;
        setErrorMsg(msg);
        return null;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      return url;
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'No se pudo generar el reporte.');
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuardar = async () => {
    // Siempre regenerar para capturar las últimas ediciones del encabezado o selección.
    const url = await generatePdf();
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-drna-${(filterMonth || 'mes').toLowerCase()}-${filterYear || ''}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleImprimir = async () => {
    // Siempre regenerar para capturar las últimas ediciones del encabezado o selección.
    const url = await generatePdf();
    if (!url) return;
    const win = window.open(url, '_blank');
    if (!win) {
      setErrorMsg('Tu navegador bloqueó la nueva pestaña. Permítela y vuelve a intentar.');
      return;
    }
    win.addEventListener('load', () => {
      try {
        win.focus();
        win.print();
      } catch {
        // Si el navegador bloquea print, el usuario aún puede imprimir desde la pestaña abierta.
      }
    });
  };

  const handleClose = () => {
    setPdfUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 overflow-y-auto">
      <div className="min-h-screen flex flex-col">
        <div className="flex flex-wrap gap-2 justify-between items-center p-3 bg-navy text-white shadow-lg sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <h2 className="text-base font-bold">Reporte DRNA — {filterMonth} {filterYear}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-primary text-sm py-2 px-4 disabled:opacity-50 inline-flex items-center gap-2"
              disabled={submitting || !someSelected}
              onClick={() => void handleGuardar()}
            >
              <Save className="w-4 h-4" /> Guardar
            </button>
            <button
              type="button"
              className="btn-secondary text-sm py-2 px-4 bg-white text-navy border-white hover:bg-gray-100 disabled:opacity-50 inline-flex items-center gap-2"
              disabled={submitting || !someSelected}
              onClick={() => void handleImprimir()}
            >
              <Printer className="w-4 h-4" /> Imprimir
            </button>
            <button
              type="button"
              className="btn-secondary text-sm py-2 px-4 border-white text-white hover:bg-white/10 inline-flex items-center gap-2"
              onClick={handleClose}
            >
              <X className="w-4 h-4" /> Cerrar Pantalla
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 lg:p-6 bg-gray-100">
          {errorMsg && (
            <div className="max-w-6xl mx-auto mb-4 bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm">
              {errorMsg}
            </div>
          )}
          {submitting && (
            <div className="max-w-6xl mx-auto mb-4 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm text-navy inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Generando reporte...
            </div>
          )}

          <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow p-4 lg:p-6 space-y-5">
            <section>
              <h3 className="bg-navy text-white text-sm font-bold px-3 py-2 rounded-t">INFORMACIÓN DE LA INSTITUCIÓN</h3>
              <div className="border border-navy/30 border-t-0 rounded-b p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <label className="space-y-1">
                  <span className="text-xs text-gray-600 uppercase">Institución</span>
                  <input value={institucion} onChange={(e) => setInstitucion(e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs text-gray-600 uppercase">Lugar</span>
                  <input value={lugar} onChange={(e) => setLugar(e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs text-gray-600 uppercase">Fecha del curso</span>
                  <input value={fechaCurso} onChange={(e) => setFechaCurso(e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs text-gray-600 uppercase">Fecha del examen</span>
                  <input value={fechaExamen} onChange={(e) => setFechaExamen(e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300" />
                </label>
                <label className="space-y-1 md:col-span-2">
                  <span className="text-xs text-gray-600 uppercase">Días de clase</span>
                  <div className="flex flex-wrap gap-3 text-xs">
                    {([
                      ['lunes', 'Lunes'],
                      ['martes', 'Martes'],
                      ['miercoles', 'Miércoles'],
                      ['jueves', 'Jueves'],
                      ['viernes', 'Viernes'],
                      ['sabado', 'Sábado'],
                      ['domingo', 'Domingo'],
                    ] as Array<[keyof DiasClase, string]>).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={diasClase[key]}
                          onChange={(e) => setDiasClase({ ...diasClase, [key]: e.target.checked })}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </label>
                <label className="space-y-1">
                  <span className="text-xs text-gray-600 uppercase">Horario</span>
                  <input value={horario} onChange={(e) => setHorario(e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs text-gray-600 uppercase">Fecha conferencia 430</span>
                  <input value={fechaConferencia} onChange={(e) => setFechaConferencia(e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300" />
                </label>
                <label className="space-y-1 md:col-span-2">
                  <span className="text-xs text-gray-600 uppercase">Dirección física del curso</span>
                  <input value={direccionFisicaCurso} onChange={(e) => setDireccionFisicaCurso(e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300" />
                </label>
                <div className="space-y-1">
                  <span className="text-xs text-gray-600 uppercase">Número de estudiantes (matrícula)</span>
                  <p className="px-3 py-2 rounded bg-gray-100 border border-gray-200">{registrations.length}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-gray-600 uppercase">Número de estudiantes que completaron el curso</span>
                  <p className="px-3 py-2 rounded bg-gray-100 border border-gray-200">{completedCount}</p>
                </div>
                <label className="space-y-1">
                  <span className="text-xs text-gray-600 uppercase">Persona a cargo del examen</span>
                  <input value={personaACargo} onChange={(e) => setPersonaACargo(e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs text-gray-600 uppercase">Teléfono de contacto</span>
                  <input value={telefonoContacto} onChange={(e) => setTelefonoContacto(e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300" />
                </label>
                <label className="space-y-1 md:col-span-2">
                  <span className="text-xs text-gray-600 uppercase">Pie de página (mes/año)</span>
                  <input value={pieReporte} onChange={(e) => setPieReporte(e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300" placeholder="Boating Octubre 2025" />
                </label>
              </div>
            </section>

            <section>
              <div className="flex flex-wrap items-center justify-between gap-2 bg-navy text-white text-sm font-bold px-3 py-2 rounded-t">
                <span>INFORMACIÓN DE LOS ESTUDIANTES</span>
                <span className="text-xs font-normal text-white/80">{selectedCount} de {registrations.length} seleccionados</span>
              </div>
              <div className="border border-navy/30 border-t-0 rounded-b overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-2 py-2 text-left">
                        <label className="inline-flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            ref={(el) => {
                              if (el) el.indeterminate = !allSelected && someSelected;
                            }}
                            onChange={(e) => toggleAll(e.target.checked)}
                          />
                          Todos
                        </label>
                      </th>
                      <th className="px-2 py-2 text-left">Apellidos, Nombre Inicial</th>
                      <th className="px-2 py-2 text-left">Fecha de nacimiento</th>
                      <th className="px-2 py-2 text-left">Dirección física</th>
                      <th className="px-2 py-2 text-left">Dirección postal</th>
                      <th className="px-2 py-2 text-left">Firma del estudiante</th>
                      <th className="px-2 py-2 text-center">Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((r) => {
                      const { nota } = bestPercentageFor(r.id, examAttempts);
                      const firstName = (r.full_name || '').trim().split(/\s+/)[0] || '';
                      return (
                        <tr key={r.id} className="border-t border-gray-100">
                          <td className="px-2 py-2">
                            <input
                              type="checkbox"
                              checked={!!selected[r.id]}
                              onChange={() => toggleOne(r.id)}
                            />
                          </td>
                          <td className="px-2 py-2 font-semibold">
                            {(r.last_name || '').trim()}{firstName ? `, ${firstName}` : ''}
                          </td>
                          <td className="px-2 py-2">{formatBirthDate(r.birth_date) || '—'}</td>
                          <td className="px-2 py-2">{buildPhysicalAddress(r) || '—'}</td>
                          <td className="px-2 py-2">{buildPostalAddress(r) || '—'}</td>
                          <td className="px-2 py-2 italic text-gray-700">
                            {`${(r.full_name || '').trim()} ${(r.last_name || '').trim()}`.trim() || '—'}
                          </td>
                          <td className="px-2 py-2 text-center font-semibold">{nota}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {registrations.length === 0 && (
                <p className="text-sm text-gray-600 mt-3">No hay matrículas con los filtros actuales.</p>
              )}
            </section>

            {pdfUrl && (
              <section>
                <h3 className="bg-navy text-white text-sm font-bold px-3 py-2 rounded-t">VISTA PREVIA DEL PDF</h3>
                <div className="border border-navy/30 border-t-0 rounded-b">
                  <iframe title="Reporte DRNA" src={`${pdfUrl}#toolbar=0`} className="w-full h-[70vh] bg-white" />
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
