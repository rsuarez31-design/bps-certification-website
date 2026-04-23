/**
 * PANEL ADMINISTRATIVO
 *
 * Solo para administradores del BPS. Protegida con usuario y contraseña.
 *
 * Pestañas:
 * - Matrículas: tabla con filtros, detalles, tracking number
 * - Examen Oficial: historial de intentos del examen OFICIAL (la práctica no se persiste)
 * - Preguntas Falladas: top 10 preguntas con más errores
 * - Banco de Preguntas: lista de las 75 preguntas con subida/baja de imagenes
 * - Configuración: mes y año del curso
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase-client';
import {
  Lock, Users, AlertTriangle,
  Eye, ClipboardList,
  LogOut, Settings, X, Download, Save,
  Package, FileText,
  BookOpen, Image as ImageIcon, Upload, Trash2, Loader2
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

// Pregunta completa del banco (como la devuelve /api/admin/questions).
interface BankQuestion {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_index: number;
  hint: string;
  image_url: string | null;
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
  const [activeTab, setActiveTab] = useState<'registrations' | 'exams' | 'questions' | 'bank' | 'config'>('registrations');

  // Banco de preguntas (pestana "Banco de Preguntas")
  const [bankQuestions, setBankQuestions] = useState<BankQuestion[]>([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankError, setBankError] = useState<string | null>(null);
  const [selectedBankQuestion, setSelectedBankQuestion] = useState<BankQuestion | null>(null);
  const [uploadingQuestionId, setUploadingQuestionId] = useState<number | null>(null);
  const [deletingQuestionId, setDeletingQuestionId] = useState<number | null>(null);
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

  // --- Cache por pestaña (lazy load + TTL / stale-while-revalidate) ---
  //
  // Motivacion: antes cada login o pulsacion de "Actualizar Datos" disparaba
  // 4 queries pesadas (matriculas + exam_attempts + exam_attempt_answers +
  // exam_questions) aunque el admin solo mirase una pestana. Con este cache:
  //  - Al cambiar de pestana, solo cargamos si los datos estan "stale" (> TTL)
  //  - Si hay datos previos, la recarga es "silent" (sin spinner bloqueante)
  //  - Al cambiar filtros o pulsar "Actualizar Datos" forzamos bypass del TTL
  type TabKey = 'registrations' | 'exams' | 'questions' | 'bank' | 'config';
  const STALE_MS = 30_000;
  const lastLoadedAt = useRef<Record<TabKey, number>>({
    registrations: 0, exams: 0, questions: 0, bank: 0, config: 0,
  });
  const isStale = (k: TabKey) => Date.now() - lastLoadedAt.current[k] >= STALE_MS;
  const markFresh = (k: TabKey) => { lastLoadedAt.current[k] = Date.now(); };
  const markStale = (k: TabKey) => { lastLoadedAt.current[k] = 0; };

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
        // El useEffect [isAuthenticated, activeTab] dispara la carga de la
        // pestana activa inicial ('registrations'). No precargamos las otras
        // pestanas: se cargaran la primera vez que el admin las abra.
      } else {
        setLoginError('Usuario o contraseña incorrectos');
      }
    } catch {
      setLoginError('Error al conectar con el servidor');
    }
  };

  // --- Cargar matrículas desde ruta API segura ---
  //
  // opts.silent = true -> no muestra spinner bloqueante (stale-while-revalidate
  // al cambiar de pestana). La UI sigue mostrando los datos previos hasta que
  // la nueva respuesta los sustituya.
  const loadRegistrations = async (opts: { silent?: boolean } = {}) => {
    if (!opts.silent) setIsLoading(true);
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
      markFresh('registrations');
    } catch (error) {
      console.error('Error al cargar matrículas:', error);
      setRegistrationsError('No se pudo conectar para cargar matrículas. Revisa tu red o vuelve a intentar.');
      setRegistrations([]);
    } finally {
      if (!opts.silent) setIsLoading(false);
    }
  };

  // --- Examen Oficial: cargar intentos ---
  //
  // SOLO intentos de tipo 'oficial'. El examen de practica no se persiste
  // nunca (es anonimo y efimero), por lo que cualquier fila de 'practica'
  // seria historica pre-migracion y de todos modos se borro en
  // migracion-v4-banco-75.sql.
  const loadExams = async (opts: { silent?: boolean } = {}) => {
    if (!opts.silent) setIsLoading(true);
    try {
      const { data: attempts, error } = await supabase
        .from('exam_attempts')
        .select('*')
        .eq('exam_type', 'oficial')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setExamAttempts((attempts || []) as ExamAttempt[]);
      markFresh('exams');
    } catch (error) {
      console.error('Error al cargar examenes:', error);
    } finally {
      if (!opts.silent) setIsLoading(false);
    }
  };

  // --- Preguntas Falladas: top 10 ---
  //
  // Respuestas incorrectas restringidas por inner-join a intentos oficiales:
  // asi aunque quedaran respuestas historicas de practica, no contaminan el
  // analisis pedagogico de las preguntas del examen real.
  const loadFailedQuestions = async (opts: { silent?: boolean } = {}) => {
    if (!opts.silent) setIsLoading(true);
    try {
      const { data: wrongAnswers } = await supabase
        .from('exam_attempt_answers')
        .select('question_id, exam_attempts!inner(exam_type)')
        .eq('is_correct', false)
        .eq('exam_attempts.exam_type', 'oficial');

      const { data: questions } = await supabase
        .from('exam_questions')
        .select('id, question');

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
      markFresh('questions');
    } catch (error) {
      console.error('Error al cargar preguntas falladas:', error);
    } finally {
      if (!opts.silent) setIsLoading(false);
    }
  };

  // --- Dispatcher: carga la pestana activa respetando TTL ---
  //
  // force=true -> bypass TTL, siempre recarga y muestra spinner bloqueante
  //  (usado por login y por el boton "Actualizar Datos").
  // force=false -> recarga solo si los datos estan stale; si ya hay datos
  //  previos la recarga es silent (sin flicker).
  const reloadActiveTab = async (opts: { force?: boolean } = {}) => {
    const { force = false } = opts;
    switch (activeTab) {
      case 'registrations': {
        if (!force && !isStale('registrations')) return;
        const silent = !force && registrations.length > 0;
        await loadRegistrations({ silent });
        break;
      }
      case 'exams': {
        if (!force && !isStale('exams')) return;
        const silent = !force && examAttempts.length > 0;
        await loadExams({ silent });
        break;
      }
      case 'questions': {
        if (!force && !isStale('questions')) return;
        const silent = !force && failedQuestions.length > 0;
        await loadFailedQuestions({ silent });
        break;
      }
      case 'bank': {
        if (!force && !isStale('bank')) return;
        const silent = !force && bankQuestions.length > 0;
        await loadBankQuestions({ silent });
        break;
      }
      case 'config': {
        if (!force && !isStale('config')) return;
        await loadConfig();
        break;
      }
    }
  };

  // Al iniciar sesion o al activar una pestana, cargamos sus datos si estan
  // stale (respeta TTL). Con esto eliminamos el "loadAllData" pesado.
  useEffect(() => {
    if (!isAuthenticated) return;
    reloadActiveTab({ force: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, activeTab]);

  // Al cambiar los filtros de matriculas, invalidamos el cache de esa pestana
  // y recargamos si esta activa (los datos previos corresponden a otro filtro).
  useEffect(() => {
    if (!isAuthenticated) return;
    markStale('registrations');
    if (activeTab === 'registrations') {
      loadRegistrations({ silent: registrations.length > 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMonth, filterYear]);

  // --- Cargar configuración del curso ---
  const loadConfig = async () => {
    try {
      const res = await fetch('/api/admin/config');
      const data = await res.json();
      if (data.course_month) setConfigMonth(data.course_month);
      if (data.course_year) setConfigYear(data.course_year);
      markFresh('config');
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

  // --- Banco de preguntas: cargar listado completo ---
  //
  // opts.silent = true -> revalidacion en background sin spinner bloqueante
  // (usado cuando el TTL expira y hay datos previos). El boton "Recargar" de
  // la pestana si muestra el spinner (silent=false por default).
  const loadBankQuestions = async (opts: { silent?: boolean } = {}) => {
    if (!opts.silent) setBankLoading(true);
    setBankError(null);
    try {
      const res = await fetch('/api/admin/questions');
      const data = await res.json();
      if (!res.ok) {
        setBankError(data?.error || 'No se pudo cargar el banco de preguntas.');
        setBankQuestions([]);
      } else {
        setBankQuestions((data.questions || []) as BankQuestion[]);
      }
      markFresh('bank');
    } catch (err: any) {
      setBankError('Error de conexion al cargar el banco.');
      setBankQuestions([]);
    } finally {
      if (!opts.silent) setBankLoading(false);
    }
  };

  // --- Banco: subir imagen para una pregunta especifica ---
  const uploadQuestionImage = async (questionId: number, file: File) => {
    setUploadingQuestionId(questionId);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`/api/admin/questions/${questionId}/image`, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        alert(data?.error || 'No se pudo subir la imagen.');
        return;
      }
      // Refresca el listado local y el modal si estaba abierto
      setBankQuestions(prev => prev.map(q => q.id === questionId ? { ...q, image_url: data.image_url } : q));
      if (selectedBankQuestion?.id === questionId) {
        setSelectedBankQuestion(prev => prev ? { ...prev, image_url: data.image_url } : null);
      }
    } catch (err: any) {
      alert('Error de conexion al subir la imagen.');
    } finally {
      setUploadingQuestionId(null);
    }
  };

  // --- Banco: eliminar imagen de una pregunta ---
  const deleteQuestionImage = async (questionId: number) => {
    if (!confirm('Eliminar la imagen de esta pregunta?')) return;
    setDeletingQuestionId(questionId);
    try {
      const res = await fetch(`/api/admin/questions/${questionId}/image`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        alert(data?.error || 'No se pudo eliminar la imagen.');
        return;
      }
      setBankQuestions(prev => prev.map(q => q.id === questionId ? { ...q, image_url: '' } : q));
      if (selectedBankQuestion?.id === questionId) {
        setSelectedBankQuestion(prev => prev ? { ...prev, image_url: '' } : null);
      }
    } catch (err: any) {
      alert('Error de conexion al eliminar la imagen.');
    } finally {
      setDeletingQuestionId(null);
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
            <button
              onClick={() => reloadActiveTab({ force: true })}
              disabled={isLoading || bankLoading}
              className="btn-secondary text-sm"
              title="Recarga los datos de la pestaña activa ignorando el caché"
            >
              {(isLoading || bankLoading) ? 'Cargando...' : 'Actualizar Datos'}
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
            { id: 'exams' as const, label: 'Examen Oficial', icon: ClipboardList },
            { id: 'questions' as const, label: 'Preguntas Falladas', icon: AlertTriangle },
            { id: 'bank' as const, label: 'Banco de Preguntas', icon: BookOpen },
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

        {/* ===== INTENTOS DE EXAMEN OFICIAL ===== */}
        {/*
          Solo se muestran intentos del examen OFICIAL. El examen de practica
          no se persiste (es anonimo y efimero), por lo que aqui nunca
          aparecera actividad de practica.
        */}
        {activeTab === 'exams' && (
          <div className="space-y-6">
            <div className="bg-navy/5 border border-navy/20 rounded-lg p-4 text-sm text-navy/80">
              Solo se muestran intentos del <strong>examen oficial</strong>. El examen
              de practica es anonimo y no se guarda en la base de datos.
            </div>
            {examAttempts.length === 0 ? (
              <div className="card text-center text-gray-500 py-12">No hay intentos de examen oficial registrados aún.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-xl shadow-md overflow-hidden">
                  <thead className="bg-navy text-white">
                    <tr>
                      <th className="py-4 px-6 text-left">Estudiante</th>
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

        {/* ===== BANCO DE PREGUNTAS ===== */}
        {/*
          Esta pestana muestra las 75 preguntas del examen con su ID, respuesta
          correcta y miniatura de imagen (si tiene). Permite:
          - Abrir una pregunta para ver su detalle completo.
          - Subir/reemplazar la imagen asociada (la imagen se guarda en
            el bucket exam-images de Supabase Storage).
          - Eliminar la imagen asociada.
          El texto y las opciones son solo lectura desde aqui: para editarlos
          se usa el SQL Editor de Supabase (es intencional para evitar cambios
          accidentales en las preguntas del examen).
        */}
        {activeTab === 'bank' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-navy flex items-center gap-2">
                  <BookOpen className="w-6 h-6" /> Banco de Preguntas
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  75 preguntas del examen oficial. Puedes subir o reemplazar la imagen
                  de cada pregunta desde aqui.
                </p>
              </div>
              <button
                onClick={() => loadBankQuestions()}
                disabled={bankLoading}
                className="btn-secondary text-sm disabled:opacity-50"
              >
                {bankLoading ? 'Cargando...' : 'Recargar'}
              </button>
            </div>

            {bankError && (
              <div className="bg-maritime-red/10 border border-maritime-red text-maritime-red rounded-lg p-4 text-sm">
                {bankError}
              </div>
            )}

            {bankLoading && bankQuestions.length === 0 ? (
              <div className="card text-center py-12 text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                Cargando banco de preguntas...
              </div>
            ) : bankQuestions.length === 0 ? (
              <div className="card text-center text-gray-500 py-12">
                No hay preguntas en el banco. Ejecuta la migracion SQL primero.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-xl shadow-md overflow-hidden">
                  <thead className="bg-navy text-white">
                    <tr>
                      <th className="py-4 px-6 text-center w-16">ID</th>
                      <th className="py-4 px-6 text-left">Pregunta</th>
                      <th className="py-4 px-6 text-center w-32">Respuesta</th>
                      <th className="py-4 px-6 text-center w-28">Imagen</th>
                      <th className="py-4 px-6 text-center w-40">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bankQuestions.map(q => {
                      const correctLetter = ['A', 'B', 'C', 'D'][q.correct_index] || '?';
                      const hasImg = !!(q.image_url && q.image_url.trim() !== '');
                      return (
                        <tr key={q.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-6 text-center font-bold text-navy">#{q.id}</td>
                          <td className="py-4 px-6 text-sm text-gray-800 max-w-xl">
                            <p className="line-clamp-2">{q.question}</p>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-maritime-green/20 text-maritime-green font-bold">
                              {correctLetter}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            {hasImg ? (
                              <img
                                src={q.image_url || ''}
                                alt={`Imagen pregunta ${q.id}`}
                                className="w-16 h-16 object-cover rounded mx-auto border border-gray-200"
                              />
                            ) : (
                              <span className="text-xs text-gray-400">Sin imagen</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() => setSelectedBankQuestion(q)}
                              className="inline-flex items-center gap-1 text-sm text-navy hover:underline"
                            >
                              <Eye className="w-4 h-4" /> Ver detalles
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modal de detalle de pregunta del banco */}
        {selectedBankQuestion && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedBankQuestion(null)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-navy">
                  Pregunta #{selectedBankQuestion.id}
                </h3>
                <button
                  onClick={() => setSelectedBankQuestion(null)}
                  className="p-2 hover:bg-gray-100 rounded"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h4 className="font-semibold text-navy mb-2">Pregunta</h4>
                  <p className="text-gray-800 leading-relaxed">{selectedBankQuestion.question}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-navy mb-2">Opciones</h4>
                  <ul className="space-y-2">
                    {(['option_a', 'option_b', 'option_c', 'option_d'] as const).map((key, idx) => {
                      const isCorrect = idx === selectedBankQuestion.correct_index;
                      const letter = ['A', 'B', 'C', 'D'][idx];
                      return (
                        <li
                          key={key}
                          className={`p-3 rounded-lg border ${isCorrect ? 'bg-maritime-green/10 border-maritime-green' : 'bg-gray-50 border-gray-200'}`}
                        >
                          <strong>{letter})</strong> {selectedBankQuestion[key]}
                          {isCorrect && (
                            <span className="ml-2 text-xs font-bold text-maritime-green">
                              CORRECTA
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-navy mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Imagen
                  </h4>
                  {selectedBankQuestion.image_url && selectedBankQuestion.image_url.trim() !== '' ? (
                    <div className="space-y-3">
                      <img
                        src={selectedBankQuestion.image_url}
                        alt={`Imagen pregunta ${selectedBankQuestion.id}`}
                        className="max-w-full max-h-[300px] object-contain rounded-lg border border-gray-200 mx-auto"
                      />
                      <button
                        onClick={() => deleteQuestionImage(selectedBankQuestion.id)}
                        disabled={deletingQuestionId === selectedBankQuestion.id}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-maritime-red text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        {deletingQuestionId === selectedBankQuestion.id ? 'Eliminando...' : 'Eliminar imagen'}
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Esta pregunta no tiene imagen asociada.</p>
                  )}

                  <div className="mt-4 bg-ice rounded-lg p-4">
                    <label className="block text-sm font-semibold text-navy mb-2">
                      Subir / reemplazar imagen
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      disabled={uploadingQuestionId === selectedBankQuestion.id}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadQuestionImage(selectedBankQuestion.id, file);
                        e.target.value = '';
                      }}
                      className="block text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      JPG o PNG, maximo 5 MB. Al subir una imagen nueva se
                      reemplaza la anterior.
                    </p>
                    {uploadingQuestionId === selectedBankQuestion.id && (
                      <p className="text-sm text-navy mt-2 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Subiendo...
                      </p>
                    )}
                  </div>
                </div>
              </div>
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
