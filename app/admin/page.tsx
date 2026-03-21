/**
 * PANEL ADMINISTRATIVO
 *
 * Solo para administradores del BPS. Protegida con usuario y contraseña.
 *
 * Pestañas:
 * - Matrículas: tabla con filtros, detalles, tracking number
 * - Exámenes: historial de intentos
 * - Preguntas Falladas: top 10 preguntas con más errores
 * - Configuración: mes y año del curso
 */

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import {
  Lock, Users, AlertTriangle,
  Eye, ClipboardList,
  LogOut, Settings, X, Download, Save,
  Package, FileText
} from 'lucide-react';

// --- Tipos de datos ---

interface Registration {
  id: string;
  created_at: string;
  course_name: string;
  course_date: string;
  full_name: string;
  last_name: string;
  postal_address: string;
  physical_address: string;
  city: string;
  country: string;
  zip_code: string;
  phone: string;
  cellphone: string;
  email: string;
  gender: string;
  birth_date: string;
  is_minor: boolean;
  parent_guardian_signature: string;
  parent_guardian_signed_at: string;
  hair_color: string;
  eye_color: string;
  height_feet: string;
  height_inches: string;
  boat_type: string;
  boat_length: string;
  has_trailer: string;
  years_experience: string;
  motor_power: string;
  wants_book_shipping: boolean;
  amount_total_cents: number;
  payment_status: string;
  id_document_path: string;
  id_document_url: string | null;
  tracking_number: string;
  stripe_session_id: string;
  stripe_payment_intent_id: string;
}

interface ExamAttempt {
  id: string;
  created_at: string;
  student_name: string;
  student_email: string;
  exam_type: string;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  percentage: number;
  passed: boolean;
}

interface FailedQuestion {
  question_id: number;
  question_text: string;
  fail_count: number;
}

/** Compara el estado guardado en BD (puede variar mayúsculas) */
function estadoEsPagado(status: string | null | undefined) {
  return (status || '').toLowerCase().trim() === 'paid';
}

// Meses del año para filtros y configuración
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function AdminPage() {
  // Login
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Datos
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([]);
  const [failedQuestions, setFailedQuestions] = useState<FailedQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Navegación y filtros
  const [activeTab, setActiveTab] = useState<'registrations' | 'exams' | 'questions' | 'config'>('registrations');
  const [filterMonth, setFilterMonth] = useState('Todos');
  const [filterYear, setFilterYear] = useState('Todos');
  /** Mensaje si la API de matrículas falla (antes la lista quedaba vacía sin explicación) */
  const [registrationsError, setRegistrationsError] = useState<string | null>(null);

  // Modal de detalle de matrícula
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);

  // Tracking number en edición
  const [editingTracking, setEditingTracking] = useState('');
  const [savingTracking, setSavingTracking] = useState(false);

  // Configuración del curso
  const [configMonth, setConfigMonth] = useState('Enero');
  const [configYear, setConfigYear] = useState('2026');
  const [savingConfig, setSavingConfig] = useState(false);
  const [configMessage, setConfigMessage] = useState('');

  // --- Login ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        loadAllData();
        loadConfig();
      } else {
        setLoginError('Usuario o contraseña incorrectos');
      }
    } catch {
      setLoginError('Error al conectar con el servidor');
    }
  };

  // --- Cargar matrículas desde ruta API segura ---
  const loadRegistrations = async () => {
    setRegistrationsError(null);
    try {
      const params = new URLSearchParams();
      if (filterMonth !== 'Todos') params.set('month', filterMonth);
      if (filterYear !== 'Todos') params.set('year', filterYear);

      const qs = params.toString();
      const res = await fetch(qs ? `/api/admin/registrations?${qs}` : '/api/admin/registrations');
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data.error || `Error del servidor (${res.status}) al cargar matrículas.`;
        setRegistrationsError(msg);
        setRegistrations([]);
        console.error('Error HTTP al cargar matrículas:', res.status, data);
        return;
      }
      if (Array.isArray(data.registrations)) {
        setRegistrations(data.registrations);
      } else if (data.error) {
        setRegistrationsError(data.error);
        setRegistrations([]);
      } else {
        setRegistrations([]);
      }
    } catch (error) {
      console.error('Error al cargar matrículas:', error);
      setRegistrationsError('No se pudo conectar para cargar matrículas. Revisa tu red o vuelve a intentar.');
      setRegistrations([]);
    }
  };

  // --- Cargar todos los datos ---
  const loadAllData = async () => {
    setIsLoading(true);
    try {
      // Matrículas (via API segura)
      await loadRegistrations();

      // Exámenes (tabla pública)
      const { data: attempts } = await supabase
        .from('exam_attempts')
        .select('*')
        .order('created_at', { ascending: false });

      // Respuestas incorrectas para preguntas más falladas
      const { data: wrongAnswers } = await supabase
        .from('exam_attempt_answers')
        .select('question_id')
        .eq('is_correct', false);

      // Preguntas del examen
      const { data: questions } = await supabase
        .from('exam_questions')
        .select('id, question');

      const attemptsList = (attempts || []) as ExamAttempt[];
      setExamAttempts(attemptsList);

      // Calcular preguntas más falladas
      if (wrongAnswers && questions) {
        const failCounts: { [key: number]: number } = {};
        wrongAnswers.forEach((a: { question_id: number }) => {
          failCounts[a.question_id] = (failCounts[a.question_id] || 0) + 1;
        });
        const questionsMap: { [key: number]: string } = {};
        questions.forEach((q: { id: number; question: string }) => {
          questionsMap[q.id] = q.question;
        });
        const sorted = Object.entries(failCounts)
          .map(([qId, count]) => ({
            question_id: parseInt(qId),
            question_text: questionsMap[parseInt(qId)] || `Pregunta #${qId}`,
            fail_count: count,
          }))
          .sort((a, b) => b.fail_count - a.fail_count)
          .slice(0, 10);
        setFailedQuestions(sorted);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Recargar matrículas al iniciar sesión o al cambiar filtros
  useEffect(() => {
    if (!isAuthenticated) return;
    loadRegistrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, filterMonth, filterYear]);

  // --- Cargar configuración del curso ---
  const loadConfig = async () => {
    try {
      const res = await fetch('/api/admin/config');
      const data = await res.json();
      if (data.course_month) setConfigMonth(data.course_month);
      if (data.course_year) setConfigYear(data.course_year);
    } catch (err) {
      console.warn('No se pudo cargar la configuración:', err);
    }
  };

  // --- Guardar configuración ---
  const saveConfig = async () => {
    setSavingConfig(true);
    setConfigMessage('');
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_month: configMonth, course_year: configYear }),
      });
      const data = await res.json();
      if (data.success) {
        setConfigMessage('Configuración guardada exitosamente.');
      } else {
        setConfigMessage('Error al guardar: ' + (data.error || ''));
      }
    } catch {
      setConfigMessage('Error de conexión al guardar.');
    } finally {
      setSavingConfig(false);
    }
  };

  // --- Guardar tracking number ---
  const saveTracking = async (regId: string) => {
    setSavingTracking(true);
    try {
      await fetch('/api/admin/tracking', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: regId, trackingNumber: editingTracking }),
      });
      // Actualizar en la lista local
      setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, tracking_number: editingTracking } : r));
      if (selectedRegistration?.id === regId) {
        setSelectedRegistration(prev => prev ? { ...prev, tracking_number: editingTracking } : null);
      }
    } catch (err) {
      console.error('Error al guardar tracking:', err);
    } finally {
      setSavingTracking(false);
    }
  };

  // --- Logout ---
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  // ===== PANTALLA DE LOGIN =====
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-ice flex items-center justify-center pt-28 pb-20">
        <div className="card max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-navy" />
            </div>
            <h1 className="text-3xl font-bold text-navy">Panel Administrativo</h1>
            <p className="text-gray-600 mt-2">Ingresa tus credenciales</p>
          </div>
          {loginError && (
            <div className="bg-maritime-red/10 border border-maritime-red rounded-lg p-3 mb-6 text-center">
              <p className="text-maritime-red font-semibold">{loginError}</p>
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="input-label">Usuario</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="input-field" placeholder="Ingresa el usuario" required />
            </div>
            <div>
              <label className="input-label">Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="Ingresa la contraseña" required />
            </div>
            <button type="submit" className="btn-primary w-full">Ingresar</button>
          </form>
        </div>
      </div>
    );
  }

  // ===== PANEL PRINCIPAL =====
  return (
    <div className="min-h-screen bg-ice pt-24 pb-8">
      <div className="container-custom">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-navy">Panel Administrativo</h1>
            <p className="text-gray-600">Americas Boating Club - Boqueron Power Squadron</p>
          </div>
          <div className="flex gap-4">
            <button onClick={loadAllData} disabled={isLoading} className="btn-secondary text-sm">
              {isLoading ? 'Cargando...' : 'Actualizar Datos'}
            </button>
            <button onClick={handleLogout} className="btn-secondary text-sm flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Pestañas */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'registrations' as const, label: 'Matrículas', icon: Users },
            { id: 'exams' as const, label: 'Exámenes', icon: ClipboardList },
            { id: 'questions' as const, label: 'Preguntas Falladas', icon: AlertTriangle },
            { id: 'config' as const, label: 'Configuración', icon: Settings },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
                activeTab === tab.id ? 'bg-navy text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===== MATRÍCULAS ===== */}
        {activeTab === 'registrations' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-navy">Matrículas pagadas</h2>
              <p className="text-gray-600 text-sm mt-1">
                Solo aparecen inscripciones con pago confirmado. Los intentos de pago cancelados no se guardan en la base de datos.
              </p>
            </div>

            {registrationsError && (
              <div className="rounded-xl border-2 border-maritime-red/40 bg-maritime-red/10 px-4 py-3 text-maritime-red font-semibold text-sm">
                {registrationsError}
              </div>
            )}

            <p className="text-sm text-gray-600 bg-white/80 rounded-lg px-4 py-3 border border-gray-200">
              <strong>Filtro por sección del curso:</strong> los selectores <em>Mes</em> y <em>Año</em> buscan dentro del{' '}
              <strong>título del curso</strong> (ej. &quot;Curso… - Agosto - 2026&quot;).
              Si no ves a alguien, prueba <strong>Mes: Todos</strong> y <strong>Año: Todos</strong>.
            </p>

            <div className="flex flex-wrap gap-3 items-center">
              {/* Filtro por mes */}
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
              >
                <option value="Todos">Mes: Todos</option>
                {MESES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>

              {/* Filtro por año */}
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
              >
                <option value="Todos">Año: Todos</option>
                {['2025', '2026', '2027', '2028'].map(y => <option key={y} value={y}>{y}</option>)}
              </select>

              {(filterMonth !== 'Todos' || filterYear !== 'Todos') && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterMonth('Todos');
                    setFilterYear('Todos');
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-maritime-gold/20 text-navy border border-maritime-gold/40 hover:bg-maritime-gold/30"
                >
                  Quitar filtro mes/año
                </button>
              )}
            </div>

            {/* Tabla de matrículas */}
            {registrations.length === 0 && !registrationsError ? (
              <div className="card text-center text-gray-600 py-12 space-y-4">
                <p className="font-semibold text-navy">No hay matrículas con los filtros actuales.</p>
                {(filterMonth !== 'Todos' || filterYear !== 'Todos') ? (
                  <div className="space-y-3">
                    <p className="text-sm">
                      Es muy probable que el <strong>título del curso</strong> de la matrícula no contenga el mes o año que elegiste arriba.
                      Pulsa el botón para mostrar todas las secciones.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setFilterMonth('Todos');
                        setFilterYear('Todos');
                      }}
                      className="btn-primary text-sm"
                    >
                      Ver todas las secciones (mes y año: Todos)
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Si acabas de cobrar en Stripe, pulsa <strong>Actualizar Datos</strong>. Si sigue vacío, confirma en Supabase que la fila usa{' '}
                    <code className="bg-gray-100 px-1 rounded">payment_status = paid</code> y que Vercel tiene la misma base de datos (<code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code>).
                  </p>
                )}
              </div>
            ) : registrations.length === 0 ? null : (
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-xl shadow-md overflow-hidden">
                  <thead className="bg-navy text-white">
                    <tr>
                      <th className="py-4 px-4 text-left">Nombre</th>
                      <th className="py-4 px-4 text-left">Apellido</th>
                      <th className="py-4 px-4 text-left">Teléfono</th>
                      <th className="py-4 px-4 text-left">Pueblo</th>
                      <th className="py-4 px-4 text-left">Email</th>
                      <th className="py-4 px-4 text-center">Estado Pago</th>
                      <th className="py-4 px-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map(reg => (
                      <tr key={reg.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-semibold">{reg.full_name}</td>
                        <td className="py-3 px-4">{reg.last_name || '—'}</td>
                        <td className="py-3 px-4">{reg.phone || '—'}</td>
                        <td className="py-3 px-4">{reg.city || '—'}</td>
                        <td className="py-3 px-4 text-sm">{reg.email}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            estadoEsPagado(reg.payment_status)
                              ? 'bg-maritime-green/20 text-maritime-green'
                              : 'bg-maritime-gold/20 text-maritime-gold'
                          }`}>
                            {estadoEsPagado(reg.payment_status) ? 'Pagada' : 'Pendiente'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              setSelectedRegistration(reg);
                              setEditingTracking(reg.tracking_number || '');
                            }}
                            className="px-3 py-1 bg-navy/10 text-navy rounded-lg text-sm font-semibold hover:bg-navy/20 transition-colors inline-flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" /> Ver Detalles
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ===== MODAL DE DETALLES ===== */}
        {selectedRegistration && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto pt-20 pb-10 px-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 relative">
              <button
                onClick={() => setSelectedRegistration(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-bold text-navy mb-6">Detalles de Matrícula</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {/* Información del Curso */}
                <div className="md:col-span-2 bg-navy/5 rounded-lg p-4 mb-2">
                  <h3 className="font-bold text-navy mb-2">Información del Curso</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div><span className="text-gray-500">Título:</span> <span className="font-semibold">{selectedRegistration.course_name || '—'}</span></div>
                    <div><span className="text-gray-500">Fecha Matrícula:</span> <span className="font-semibold">{selectedRegistration.course_date || '—'}</span></div>
                  </div>
                </div>

                {/* Datos Personales */}
                <div className="md:col-span-2 bg-navy/5 rounded-lg p-4 mb-2">
                  <h3 className="font-bold text-navy mb-2">Datos Personales</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div><span className="text-gray-500">Nombre:</span> <span className="font-semibold">{selectedRegistration.full_name}</span></div>
                    <div><span className="text-gray-500">Apellido:</span> <span className="font-semibold">{selectedRegistration.last_name || '—'}</span></div>
                    <div><span className="text-gray-500">Dir. Postal:</span> <span className="font-semibold">{selectedRegistration.postal_address || '—'}</span></div>
                    <div><span className="text-gray-500">Dir. Física:</span> <span className="font-semibold">{selectedRegistration.physical_address || '—'}</span></div>
                    <div><span className="text-gray-500">Ciudad:</span> <span className="font-semibold">{selectedRegistration.city || '—'}</span></div>
                    <div><span className="text-gray-500">País:</span> <span className="font-semibold">{selectedRegistration.country || '—'}</span></div>
                    <div><span className="text-gray-500">Código Postal:</span> <span className="font-semibold">{selectedRegistration.zip_code || '—'}</span></div>
                    <div><span className="text-gray-500">Teléfono:</span> <span className="font-semibold">{selectedRegistration.phone || '—'}</span></div>
                    <div><span className="text-gray-500">Celular:</span> <span className="font-semibold">{selectedRegistration.cellphone || '—'}</span></div>
                    <div><span className="text-gray-500">Email:</span> <span className="font-semibold">{selectedRegistration.email}</span></div>
                    <div><span className="text-gray-500">Sexo:</span> <span className="font-semibold">{selectedRegistration.gender || '—'}</span></div>
                    <div><span className="text-gray-500">Fecha Nacimiento:</span> <span className="font-semibold">{selectedRegistration.birth_date || '—'}</span></div>
                    <div><span className="text-gray-500">¿Menor?:</span> <span className="font-semibold">{selectedRegistration.is_minor ? 'Sí' : 'No'}</span></div>
                    {selectedRegistration.is_minor && (
                      <>
                        <div><span className="text-gray-500">Firma Padre/Tutor:</span> <span className="font-semibold">{selectedRegistration.parent_guardian_signature || '—'}</span></div>
                        <div><span className="text-gray-500">Fecha Firma:</span> <span className="font-semibold">{selectedRegistration.parent_guardian_signed_at || '—'}</span></div>
                      </>
                    )}
                  </div>
                </div>

                {/* Características Físicas */}
                <div className="bg-navy/5 rounded-lg p-4">
                  <h3 className="font-bold text-navy mb-2">Características Físicas</h3>
                  <div className="space-y-1">
                    <div><span className="text-gray-500">Cabello:</span> <span className="font-semibold">{selectedRegistration.hair_color || '—'}</span></div>
                    <div><span className="text-gray-500">Ojos:</span> <span className="font-semibold">{selectedRegistration.eye_color || '—'}</span></div>
                    <div><span className="text-gray-500">Estatura:</span> <span className="font-semibold">{selectedRegistration.height_feet || '—'}&apos; {selectedRegistration.height_inches || '—'}&quot;</span></div>
                  </div>
                </div>

                {/* Embarcación */}
                <div className="bg-navy/5 rounded-lg p-4">
                  <h3 className="font-bold text-navy mb-2">Embarcación</h3>
                  <div className="space-y-1">
                    <div><span className="text-gray-500">Tipo:</span> <span className="font-semibold">{selectedRegistration.boat_type || '—'}</span></div>
                    <div><span className="text-gray-500">Eslora:</span> <span className="font-semibold">{selectedRegistration.boat_length || '—'}</span></div>
                    <div><span className="text-gray-500">Remolque:</span> <span className="font-semibold">{selectedRegistration.has_trailer || '—'}</span></div>
                    <div><span className="text-gray-500">Experiencia:</span> <span className="font-semibold">{selectedRegistration.years_experience || '—'} años</span></div>
                    <div><span className="text-gray-500">Motor:</span> <span className="font-semibold">{selectedRegistration.motor_power || '—'} HP</span></div>
                  </div>
                </div>

                {/* Documento de ID */}
                <div className="md:col-span-2 bg-navy/5 rounded-lg p-4">
                  <h3 className="font-bold text-navy mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Documento de Identificación
                  </h3>
                      {selectedRegistration.id_document_url ? (
                    <div className="flex items-center gap-4">
                      {selectedRegistration.id_document_path?.match(/\.(jpg|jpeg|png)$/i) ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={selectedRegistration.id_document_url} alt="Documento de ID" className="max-w-xs max-h-48 rounded-lg border" />
                      ) : null}
                      <a
                        href={selectedRegistration.id_document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy/80 text-sm"
                      >
                        <Download className="w-4 h-4" /> Descargar / Ver Documento
                      </a>
                    </div>
                  ) : (
                    <p className="text-gray-500">No se subió documento de identificación.</p>
                  )}
                </div>

                {/* Pago */}
                <div className="md:col-span-2 bg-navy/5 rounded-lg p-4">
                  <h3 className="font-bold text-navy mb-2">Información de Pago</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div><span className="text-gray-500">Monto Total:</span> <span className="font-bold text-navy">${((selectedRegistration.amount_total_cents || 0) / 100).toFixed(2)}</span></div>
                    <div><span className="text-gray-500">Estado:</span> <span className={`font-bold ${estadoEsPagado(selectedRegistration.payment_status) ? 'text-maritime-green' : 'text-maritime-gold'}`}>{estadoEsPagado(selectedRegistration.payment_status) ? 'Pagada' : 'Pendiente'}</span></div>
                    <div><span className="text-gray-500">Envío Libro:</span> <span className="font-semibold">{selectedRegistration.wants_book_shipping ? 'Sí (+$13.00)' : 'No'}</span></div>
                    <div><span className="text-gray-500">Fecha:</span> <span className="font-semibold">{new Date(selectedRegistration.created_at).toLocaleDateString('es-PR', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                  </div>
                </div>

                {/* Tracking Number (solo si pidió envío de libro) */}
                {selectedRegistration.wants_book_shipping && (
                  <div className="md:col-span-2 bg-maritime-gold/10 border border-maritime-gold rounded-lg p-4">
                    <h3 className="font-bold text-navy mb-2 flex items-center gap-2">
                      <Package className="w-4 h-4" /> Número de Rastreo (Tracking)
                    </h3>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={editingTracking}
                        onChange={(e) => setEditingTracking(e.target.value)}
                        placeholder="Ingresa el número de rastreo"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <button
                        onClick={() => saveTracking(selectedRegistration.id)}
                        disabled={savingTracking}
                        className="px-4 py-2 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy/80 inline-flex items-center gap-2 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" /> {savingTracking ? 'Guardando...' : 'Guardar'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== EXÁMENES ===== */}
        {activeTab === 'exams' && (
          <div className="space-y-6">
            {examAttempts.length === 0 ? (
              <div className="card text-center text-gray-500 py-12">No hay intentos de examen registrados aún.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-xl shadow-md overflow-hidden">
                  <thead className="bg-navy text-white">
                    <tr>
                      <th className="py-4 px-6 text-left">Estudiante</th>
                      <th className="py-4 px-6 text-left">Tipo</th>
                      <th className="py-4 px-6 text-center">Correctas</th>
                      <th className="py-4 px-6 text-center">Incorrectas</th>
                      <th className="py-4 px-6 text-center">Porcentaje</th>
                      <th className="py-4 px-6 text-center">Resultado</th>
                      <th className="py-4 px-6 text-left">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examAttempts.map(attempt => (
                      <tr key={attempt.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-6 font-semibold">{attempt.student_name}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${attempt.exam_type === 'oficial' ? 'bg-navy/10 text-navy' : 'bg-blue-100 text-blue-600'}`}>{attempt.exam_type}</span>
                        </td>
                        <td className="py-4 px-6 text-center text-maritime-green font-bold">{attempt.correct_answers}</td>
                        <td className="py-4 px-6 text-center text-maritime-red font-bold">{attempt.incorrect_answers}</td>
                        <td className="py-4 px-6 text-center font-bold">{attempt.percentage}%</td>
                        <td className="py-4 px-6 text-center">
                          {attempt.passed
                            ? <span className="bg-maritime-green/20 text-maritime-green px-3 py-1 rounded-full text-sm font-bold">Aprobado</span>
                            : <span className="bg-maritime-red/20 text-maritime-red px-3 py-1 rounded-full text-sm font-bold">No Aprobado</span>}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">{new Date(attempt.created_at).toLocaleDateString('es-PR', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ===== PREGUNTAS FALLADAS ===== */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-2xl font-bold text-navy mb-6">Top 10 Preguntas Más Falladas</h2>
              {failedQuestions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay datos suficientes aún.</p>
              ) : (
                <div className="space-y-4">
                  {failedQuestions.map((q, index) => (
                    <div key={q.question_id} className="flex items-start gap-4 p-4 rounded-lg bg-ice">
                      <div className="w-10 h-10 bg-maritime-red/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-maritime-red">#{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{q.question_text}</p>
                        <p className="text-sm text-gray-500 mt-1">Pregunta #{q.question_id}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-2xl font-bold text-maritime-red">{q.fail_count}</p>
                        <p className="text-xs text-gray-500">veces fallada</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== CONFIGURACIÓN ===== */}
        {activeTab === 'config' && (
          <div className="space-y-6">
            <div className="card max-w-lg">
              <h2 className="text-2xl font-bold text-navy mb-6 flex items-center gap-3">
                <Settings className="w-6 h-6" /> Configuración del Curso
              </h2>
              <p className="text-gray-600 mb-6">
                Selecciona el mes y año de la sección de curso actual. Esto se mostrará automáticamente
                en el formulario de matrícula como parte del título del curso.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="input-label">Mes del Curso</label>
                  <select value={configMonth} onChange={(e) => setConfigMonth(e.target.value)} className="input-field">
                    {MESES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Año del Curso</label>
                  <input type="number" value={configYear} onChange={(e) => setConfigYear(e.target.value)} min="2024" max="2030" className="input-field" />
                </div>

                {/* Preview del título */}
                <div className="bg-navy/5 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Vista previa del título:</p>
                  <p className="font-bold text-navy text-lg">Curso Básico De Navegación - {configMonth} - {configYear}</p>
                </div>

                <button onClick={saveConfig} disabled={savingConfig} className="btn-primary w-full disabled:opacity-50">
                  {savingConfig ? 'Guardando...' : 'Guardar Configuración'}
                </button>

                {configMessage && (
                  <p className={`text-center text-sm font-semibold ${configMessage.includes('Error') ? 'text-maritime-red' : 'text-maritime-green'}`}>
                    {configMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
