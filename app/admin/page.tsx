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

import { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase-client';
import { parseVisibilityBool } from '@/lib/site-config-visibility-parse';
import { getExamWindowStatus, parseDateTimeLocalAsPuertoRico } from '@/lib/site-config-exam-window';
import { validateRequiredRegistrationFields } from '@/lib/registration-form-validation';
import CertificateViewerModal from '@/components/CertificateViewerModal';
import DrnaReportModal from '@/components/DrnaReportModal';
import {
  Lock, Users, AlertTriangle,
  Eye, ClipboardList,
  LogOut, Settings, X, Download, Save,
  Package, FileText,
  BookOpen, Image as ImageIcon, Upload, Trash2, Loader2, UserPlus, Pencil, Award
} from 'lucide-react';

// --- Tipos de datos ---

interface Registration {
  id: string;
  created_at: string;
  course_name: string;
  course_date: string;
  course_month: string;
  course_year: string;
  enrollment_source?: string;
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
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string;
}

interface ExamAttempt {
  id: string;
  created_at: string;
  student_name: string;
  student_email: string;
  registration_id: string | null;
  exam_type: string;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  unanswered?: number;
  percentage: number;
  passed: boolean;
  full_name?: string;
  last_name?: string;
  course_month?: string;
  course_year?: string;
  certificate_pdf_path?: string | null;
  certificate_id?: string | null;
  certificate_issued_at?: string | null;
}

interface FailedQuestion {
  question_id: number;
  question_text: string;
  fail_count: number;
}

type RegistrationEditableFields = Pick<
  Registration,
  | 'course_name'
  | 'course_date'
  | 'full_name'
  | 'last_name'
  | 'postal_address'
  | 'physical_address'
  | 'city'
  | 'country'
  | 'zip_code'
  | 'phone'
  | 'cellphone'
  | 'email'
  | 'gender'
  | 'birth_date'
  | 'is_minor'
  | 'parent_guardian_signature'
  | 'parent_guardian_signed_at'
  | 'hair_color'
  | 'eye_color'
  | 'height_feet'
  | 'height_inches'
  | 'boat_type'
  | 'boat_length'
  | 'has_trailer'
  | 'years_experience'
  | 'motor_power'
>;

interface ManualRegistrationDraft extends RegistrationEditableFields {
  wants_book_shipping: boolean;
  tracking_number: string;
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

function buildCourseTitle(month: string, year: string): string {
  if (month && year) {
    return `Curso Básico De Navegación - ${month} - ${year}`;
  }
  return 'Curso de Navegación';
}

function formatPaymentMethod(
  source?: string | null,
  stripeCheckoutSessionId?: string | null,
): 'Online' | 'Manual' {
  if (source === 'manual_in_person') return 'Manual';
  if (source === 'online_stripe') return 'Online';
  if (stripeCheckoutSessionId) return 'Online';
  return 'Online';
}

// Meses del año para filtros y configuración
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const EMPTY_MANUAL_REGISTRATION: ManualRegistrationDraft = {
  course_name: '',
  course_date: '',
  full_name: '',
  last_name: '',
  postal_address: '',
  physical_address: '',
  city: '',
  country: 'Puerto Rico',
  zip_code: '',
  phone: '',
  cellphone: '',
  email: '',
  gender: '',
  birth_date: '',
  is_minor: false,
  parent_guardian_signature: '',
  parent_guardian_signed_at: '',
  hair_color: '',
  eye_color: '',
  height_feet: '',
  height_inches: '',
  boat_type: '',
  boat_length: '',
  has_trailer: '',
  years_experience: '',
  motor_power: '',
  wants_book_shipping: false,
  tracking_number: '',
};

const BOAT_TYPE_OPTIONS = [
  { value: '', label: 'Selecciona...' },
  { value: 'Ninguno', label: 'Ninguno' },
  { value: 'Outboard', label: 'Fuera de Borda (Outboard)' },
  { value: 'IO', label: 'I/O' },
  { value: 'Inboard', label: 'Intraborda (Inboard)' },
  { value: 'Sail', label: 'Vela (Sail)' },
  { value: 'PWC', label: 'PWC (Moto acuática)' },
  { value: 'Paddle', label: 'Remo/Paleta (Paddle)' },
];

const BOAT_LENGTH_OPTIONS = [
  { value: '', label: 'Selecciona...' },
  { value: "Menos de 16'", label: '< 16 pies' },
  { value: "16-25'", label: '16-25 pies' },
  { value: "26-39'", label: '26-39 pies' },
  { value: "40-54'", label: '40-54 pies' },
  { value: "55'+", label: '55+ pies' },
];

/** Verifica si el borrador de edición coincide con la matrícula guardada */
function registrationDraftMatchesSaved(draft: RegistrationEditableFields, reg: Registration): boolean {
  const keys: (keyof RegistrationEditableFields)[] = [
    'course_name', 'course_date', 'full_name', 'last_name', 'postal_address', 'physical_address',
    'city', 'country', 'zip_code', 'phone', 'cellphone', 'email', 'gender', 'birth_date', 'is_minor',
    'parent_guardian_signature', 'parent_guardian_signed_at', 'hair_color', 'eye_color',
    'height_feet', 'height_inches', 'boat_type', 'boat_length', 'has_trailer', 'years_experience', 'motor_power',
  ];
  return keys.every((k) => {
    const d = draft[k];
    const r = reg[k as keyof Registration];
    if (typeof d === 'boolean' || typeof r === 'boolean') return !!d === !!r;
    return String(d ?? '').trim() === String(r ?? '').trim();
  });
}

type SavedConfigSnapshot = {
  course_month: string;
  course_year: string;
  official_exam_start_local: string;
  official_exam_end_local: string;
  enrollment_enabled: boolean;
};

type UnsavedPromptIntent =
  | { kind: 'tab'; tab: 'registrations' | 'exams' | 'questions' | 'bank' | 'config' }
  | { kind: 'logout' }
  | { kind: 'close-reg-modal' }
  | { kind: 'close-manual-modal' };

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
  const [isEditingRegistration, setIsEditingRegistration] = useState(false);
  const [registrationDraft, setRegistrationDraft] = useState<RegistrationEditableFields | null>(null);
  const [savingRegistration, setSavingRegistration] = useState(false);
  const [uploadingRegistrationId, setUploadingRegistrationId] = useState(false);

  // Matrícula manual (pago en persona)
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualDraft, setManualDraft] = useState<ManualRegistrationDraft>(EMPTY_MANUAL_REGISTRATION);
  const [manualSaving, setManualSaving] = useState(false);
  const [manualIdFile, setManualIdFile] = useState<File | null>(null);

  // Tracking number en edición
  const [editingTracking, setEditingTracking] = useState('');
  const [savingTracking, setSavingTracking] = useState(false);

  const [certViewerOpen, setCertViewerOpen] = useState(false);
  const [certViewerUrl, setCertViewerUrl] = useState<string | null>(null);
  const [certViewerLoading, setCertViewerLoading] = useState(false);

  // Reporte DRNA (no persiste nada)
  const [drnaModalOpen, setDrnaModalOpen] = useState(false);
  const [drnaButtonError, setDrnaButtonError] = useState<string | null>(null);

  // Configuración del curso
  const [configMonth, setConfigMonth] = useState('Enero');
  const [configYear, setConfigYear] = useState('2026');
  /** Ventana pública de /examen (datetime-local, hora PR) */
  const [officialExamStart, setOfficialExamStart] = useState('');
  const [officialExamEnd, setOfficialExamEnd] = useState('');
  const [enrollmentEnabled, setEnrollmentEnabled] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [configMessage, setConfigMessage] = useState('');
  /** Valores últimos conocidos del servidor (para detectar cambios sin guardar en Configuración) */
  const [savedConfigSnapshot, setSavedConfigSnapshot] = useState<SavedConfigSnapshot>({
    course_month: 'Enero',
    course_year: '2026',
    official_exam_start_local: '',
    official_exam_end_local: '',
    enrollment_enabled: true,
  });
  /** Diálogo: salir sin guardar / guardar (pestañas Matrículas y Configuración, logout, cerrar modales) */
  const [unsavedPrompt, setUnsavedPrompt] = useState<UnsavedPromptIntent | null>(null);

  const configDirty = useMemo(
    () =>
      configMonth !== savedConfigSnapshot.course_month ||
      String(configYear) !== String(savedConfigSnapshot.course_year) ||
      officialExamStart !== savedConfigSnapshot.official_exam_start_local ||
      officialExamEnd !== savedConfigSnapshot.official_exam_end_local ||
      enrollmentEnabled !== savedConfigSnapshot.enrollment_enabled,
    [
      configMonth,
      configYear,
      officialExamStart,
      officialExamEnd,
      enrollmentEnabled,
      savedConfigSnapshot,
    ],
  );

  const examWindowStatus = useMemo(() => {
    if (!officialExamStart.trim() || !officialExamEnd.trim()) return 'unconfigured' as const;
    const startAt = parseDateTimeLocalAsPuertoRico(officialExamStart);
    const endAt = parseDateTimeLocalAsPuertoRico(officialExamEnd);
    if (!startAt || !endAt) return 'unconfigured' as const;
    return getExamWindowStatus(startAt.toISOString(), endAt.toISOString());
  }, [officialExamStart, officialExamEnd]);

  const isManualDraftDirty = () =>
    JSON.stringify(manualDraft) !== JSON.stringify(EMPTY_MANUAL_REGISTRATION) || manualIdFile !== null;

  const registrationsWorkDirty = useMemo(() => {
    if (manualModalOpen && isManualDraftDirty()) return true;
    if (!selectedRegistration) return false;
    const trackingDirty =
      (editingTracking || '').trim() !== (selectedRegistration.tracking_number || '').trim();
    if (trackingDirty) return true;
    if (isEditingRegistration && registrationDraft && !registrationDraftMatchesSaved(registrationDraft, selectedRegistration)) {
      return true;
    }
    return false;
  }, [
    manualModalOpen,
    manualDraft,
    manualIdFile,
    selectedRegistration,
    editingTracking,
    isEditingRegistration,
    registrationDraft,
  ]);

  const hasAnyUnsavedWork = configDirty || registrationsWorkDirty;

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
      const res = await fetch('/api/admin/exam-attempts', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        console.error('Error al cargar examenes:', data?.error || res.status);
        setExamAttempts([]);
        return;
      }
      setExamAttempts((data.attempts || []) as ExamAttempt[]);
      markFresh('exams');
    } catch (error) {
      console.error('Error al cargar examenes:', error);
      setExamAttempts([]);
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
        await loadConfig();
        break;
      }
    }
  };

  // Al iniciar sesion o al activar una pestana, cargamos sus datos si estan
  // stale (respeta TTL). Con esto eliminamos el "loadAllData" pesado.
  // Excepción: la pestaña de configuración siempre fuerza recarga al abrirse,
  // para que los dropdowns reflejen exactamente lo que está hoy en la BD.
  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === 'config') {
      markStale('config');
      reloadActiveTab({ force: true });
    } else {
      reloadActiveTab({ force: false });
    }
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
  // Siempre pide datos frescos al servidor (cache: 'no-store') y usa el mismo
  // parseo de booleanos que la API para que los toggles reflejen exactamente
  // lo que hay en site_config en este momento.
  const loadConfig = async () => {
    try {
      const res = await fetch('/api/admin/config', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        const hint =
          data.visibility_columns_missing && data.error
            ? String(data.error)
            : data.error || `Error ${res.status}`;
        setConfigMessage(hint);
        return;
      }
      const month =
        typeof data.course_month === 'string' && data.course_month
          ? data.course_month
          : 'Enero';
      const year = data.course_year != null ? String(data.course_year) : '2026';
      const examStartLocal =
        typeof data.official_exam_start_local === 'string' ? data.official_exam_start_local : '';
      const examEndLocal =
        typeof data.official_exam_end_local === 'string' ? data.official_exam_end_local : '';
      const enrollOn = parseVisibilityBool(data.enrollment_enabled, true);
      setConfigMonth(month);
      setConfigYear(year);
      setOfficialExamStart(examStartLocal);
      setOfficialExamEnd(examEndLocal);
      setEnrollmentEnabled(enrollOn);
      setSavedConfigSnapshot({
        course_month: month,
        course_year: year,
        official_exam_start_local: examStartLocal,
        official_exam_end_local: examEndLocal,
        enrollment_enabled: enrollOn,
      });
      markFresh('config');
    } catch (err) {
      console.warn('No se pudo cargar la configuración:', err);
    }
  };

  /** Persiste configuración y actualiza snapshot; devuelve si se guardó bien */
  const persistConfigToServer = async (): Promise<boolean> => {
    setSavingConfig(true);
    setConfigMessage('');
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_month: configMonth,
          course_year: configYear,
          official_exam_start_at: officialExamStart.trim() || null,
          official_exam_end_at: officialExamEnd.trim() || null,
          enrollment_enabled: enrollmentEnabled,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const examStartLocal =
          typeof data.official_exam_start_local === 'string' ? data.official_exam_start_local : '';
        const examEndLocal =
          typeof data.official_exam_end_local === 'string' ? data.official_exam_end_local : '';
        const persistedEnroll =
          typeof data.enrollment_enabled === 'boolean'
            ? data.enrollment_enabled
            : enrollmentEnabled;
        const persistedMonth =
          typeof data.course_month === 'string' && data.course_month
            ? data.course_month
            : configMonth;
        const persistedYear =
          data.course_year != null ? String(data.course_year) : String(configYear);
        setOfficialExamStart(examStartLocal);
        setOfficialExamEnd(examEndLocal);
        setEnrollmentEnabled(persistedEnroll);
        setConfigMonth(persistedMonth);
        setConfigYear(persistedYear);
        setSavedConfigSnapshot({
          course_month: persistedMonth,
          course_year: persistedYear,
          official_exam_start_local: examStartLocal,
          official_exam_end_local: examEndLocal,
          enrollment_enabled: persistedEnroll,
        });
        setConfigMessage('Configuración guardada exitosamente.');
        return true;
      }
      const saveErr =
        data.visibility_columns_missing && data.error
          ? String(data.error)
          : data.error || `Error ${res.status}`;
      setConfigMessage('Error al guardar: ' + saveErr);
      return false;
    } catch {
      setConfigMessage('Error de conexión al guardar.');
      return false;
    } finally {
      setSavingConfig(false);
    }
  };

  const saveConfig = async () => {
    await persistConfigToServer();
  };

  // --- Guardar tracking number ---
  const saveTracking = async (regId: string): Promise<boolean> => {
    setSavingTracking(true);
    try {
      const res = await fetch('/api/admin/tracking', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: regId, trackingNumber: editingTracking }),
      });
      if (!res.ok) {
        alert('No se pudo guardar el número de rastreo.');
        return false;
      }
      setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, tracking_number: editingTracking } : r));
      if (selectedRegistration?.id === regId) {
        setSelectedRegistration(prev => prev ? { ...prev, tracking_number: editingTracking } : null);
      }
      return true;
    } catch (err) {
      console.error('Error al guardar tracking:', err);
      return false;
    } finally {
      setSavingTracking(false);
    }
  };

  const openRegistrationDetails = (registration: Registration) => {
    setSelectedRegistration(registration);
    setEditingTracking(registration.tracking_number || '');
    setIsEditingRegistration(false);
    setRegistrationDraft({
      course_name: registration.course_name || '',
      course_date: registration.course_date || '',
      full_name: registration.full_name || '',
      last_name: registration.last_name || '',
      postal_address: registration.postal_address || '',
      physical_address: registration.physical_address || '',
      city: registration.city || '',
      country: registration.country || '',
      zip_code: registration.zip_code || '',
      phone: registration.phone || '',
      cellphone: registration.cellphone || '',
      email: registration.email || '',
      gender: registration.gender || '',
      birth_date: registration.birth_date || '',
      is_minor: registration.is_minor || false,
      parent_guardian_signature: registration.parent_guardian_signature || '',
      parent_guardian_signed_at: registration.parent_guardian_signed_at || '',
      hair_color: registration.hair_color || '',
      eye_color: registration.eye_color || '',
      height_feet: registration.height_feet || '',
      height_inches: registration.height_inches || '',
      boat_type: registration.boat_type || '',
      boat_length: registration.boat_length || '',
      has_trailer: registration.has_trailer || '',
      years_experience: registration.years_experience || '',
      motor_power: registration.motor_power || '',
    });
    void loadExams({ silent: true });
  };

  const validateRegistrationDraft = (draft: RegistrationEditableFields): string[] =>
    validateRequiredRegistrationFields({
      full_name: draft.full_name,
      last_name: draft.last_name,
      email: draft.email,
      phone: draft.phone,
      birth_date: draft.birth_date,
      gender: draft.gender,
      is_minor: draft.is_minor,
      parent_guardian_signature: draft.parent_guardian_signature,
      hair_color: draft.hair_color,
      eye_color: draft.eye_color,
      height_feet: draft.height_feet,
      height_inches: draft.height_inches,
    });

  const saveRegistrationEdits = async (): Promise<boolean> => {
    if (!selectedRegistration || !registrationDraft) return false;
    const errors = validateRegistrationDraft(registrationDraft);
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return false;
    }
    setSavingRegistration(true);
    try {
      const res = await fetch(`/api/admin/registrations/${selectedRegistration.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationDraft),
      });
      const data = await res.json();
      if (!res.ok || !data?.success || !data?.registration) {
        alert(data?.error || 'No se pudo guardar la matrícula.');
        return false;
      }
      const updated = data.registration as Registration;
      setSelectedRegistration(updated);
      setRegistrations(prev => prev.map(r => r.id === updated.id ? updated : r));
      setEditingTracking(updated.tracking_number || '');
      setIsEditingRegistration(false);
      setRegistrationDraft({
        course_name: updated.course_name || '',
        course_date: updated.course_date || '',
        full_name: updated.full_name || '',
        last_name: updated.last_name || '',
        postal_address: updated.postal_address || '',
        physical_address: updated.physical_address || '',
        city: updated.city || '',
        country: updated.country || '',
        zip_code: updated.zip_code || '',
        phone: updated.phone || '',
        cellphone: updated.cellphone || '',
        email: updated.email || '',
        gender: updated.gender || '',
        birth_date: updated.birth_date || '',
        is_minor: updated.is_minor || false,
        parent_guardian_signature: updated.parent_guardian_signature || '',
        parent_guardian_signed_at: updated.parent_guardian_signed_at || '',
        hair_color: updated.hair_color || '',
        eye_color: updated.eye_color || '',
        height_feet: updated.height_feet || '',
        height_inches: updated.height_inches || '',
        boat_type: updated.boat_type || '',
        boat_length: updated.boat_length || '',
        has_trailer: updated.has_trailer || '',
        years_experience: updated.years_experience || '',
        motor_power: updated.motor_power || '',
      });
      return true;
    } catch (error) {
      console.error('Error al actualizar matrícula:', error);
      alert('Error de conexión al guardar la matrícula.');
      return false;
    } finally {
      setSavingRegistration(false);
    }
  };

  const uploadRegistrationIdDocument = async (registrationId: string, file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxBytes = 5 * 1024 * 1024;
    if (!allowedTypes.includes(file.type)) {
      alert('Formato no válido. Solo se aceptan: JPG, PNG o PDF.');
      return false;
    }
    if (file.size > maxBytes) {
      alert('El archivo excede 5 MB.');
      return false;
    }

    setUploadingRegistrationId(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`/api/admin/registrations/${registrationId}/id-document`, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        alert(data?.error || 'No se pudo subir el documento.');
        return false;
      }
      setSelectedRegistration(prev => prev ? {
        ...prev,
        id_document_path: data.id_document_path || prev.id_document_path,
        id_document_url: data.id_document_url || prev.id_document_url,
      } : null);
      setRegistrations(prev => prev.map(r => r.id === registrationId ? {
        ...r,
        id_document_path: data.id_document_path || r.id_document_path,
        id_document_url: data.id_document_url || r.id_document_url,
      } : r));
      return true;
    } catch (error) {
      console.error('Error al subir documento:', error);
      alert('Error de conexión al subir el documento.');
      return false;
    } finally {
      setUploadingRegistrationId(false);
    }
  };

  const createManualRegistration = async (opts?: { quietSuccess?: boolean }): Promise<boolean> => {
    const draftForValidation: RegistrationEditableFields = {
      ...manualDraft,
      is_minor: manualDraft.is_minor,
    };
    const errors = validateRegistrationDraft(draftForValidation);
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return false;
    }

    if (manualIdFile) {
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      const maxBytes = 5 * 1024 * 1024;
      if (!allowedTypes.includes(manualIdFile.type)) {
        alert('Formato de ID no válido. Solo JPG, PNG o PDF.');
        return false;
      }
      if (manualIdFile.size > maxBytes) {
        alert('El archivo de ID excede 5 MB.');
        return false;
      }
    }

    setManualSaving(true);
    try {
      const payload = {
        ...manualDraft,
        payment_status: 'paid',
        enrollment_source: 'manual_in_person',
        course_month: configMonth,
        course_year: configYear,
        course_name: manualDraft.course_name || buildCourseTitle(configMonth, configYear),
      };
      const res = await fetch('/api/admin/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data?.success || !data?.registration) {
        alert(data?.error || 'No se pudo crear la matrícula manual.');
        return false;
      }

      const created = data.registration as Registration;
      if (manualIdFile) {
        await uploadRegistrationIdDocument(created.id, manualIdFile);
      }
      await loadRegistrations();
      setManualModalOpen(false);
      setManualDraft(EMPTY_MANUAL_REGISTRATION);
      setManualIdFile(null);
      if (!opts?.quietSuccess) {
        alert('Matrícula registrada como pagada en persona.');
      }
      return true;
    } catch (error) {
      console.error('Error al crear matrícula manual:', error);
      alert('Error de conexión al crear matrícula manual.');
      return false;
    } finally {
      setManualSaving(false);
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
      const res = await fetch('/api/admin/questions', { cache: 'no-store' });
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

  // --- Logout y navegación con cambios sin guardar (Matrículas + Configuración) ---
  const performLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    setUnsavedPrompt(null);
  };

  const applyPromptCompletion = (intent: UnsavedPromptIntent) => {
    if (intent.kind === 'tab') setActiveTab(intent.tab);
    else if (intent.kind === 'logout') performLogout();
  };

  const requestTabChange = (tab: 'registrations' | 'exams' | 'questions' | 'bank' | 'config') => {
    if (tab === activeTab) return;
    const leaveConfig = activeTab === 'config' && configDirty;
    const leaveRegs = activeTab === 'registrations' && registrationsWorkDirty;
    if (leaveConfig || leaveRegs) {
      setUnsavedPrompt({ kind: 'tab', tab });
      return;
    }
    setActiveTab(tab);
  };

  const requestLogout = () => {
    if (hasAnyUnsavedWork) {
      setUnsavedPrompt({ kind: 'logout' });
      return;
    }
    performLogout();
  };

  const registrationModalHasUnsaved = (): boolean => {
    if (!selectedRegistration) return false;
    const trackingDirty =
      (editingTracking || '').trim() !== (selectedRegistration.tracking_number || '').trim();
    if (trackingDirty) return true;
    return !!(isEditingRegistration && registrationDraft &&
      !registrationDraftMatchesSaved(registrationDraft, selectedRegistration));
  };

  const requestCloseRegistrationModal = () => {
    if (registrationModalHasUnsaved()) {
      setUnsavedPrompt({ kind: 'close-reg-modal' });
      return;
    }
    setSelectedRegistration(null);
    setIsEditingRegistration(false);
    setRegistrationDraft(null);
    setEditingTracking('');
  };

  const requestCloseManualModal = () => {
    if (isManualDraftDirty()) {
      setUnsavedPrompt({ kind: 'close-manual-modal' });
      return;
    }
    setManualModalOpen(false);
  };

  const handleDiscardUnsaved = () => {
    const intent = unsavedPrompt;
    if (!intent) return;

    if (intent.kind === 'close-manual-modal') {
      setManualModalOpen(false);
      setManualDraft(EMPTY_MANUAL_REGISTRATION);
      setManualIdFile(null);
      setUnsavedPrompt(null);
      return;
    }

    if (intent.kind === 'close-reg-modal') {
      setSelectedRegistration(null);
      setIsEditingRegistration(false);
      setRegistrationDraft(null);
      setEditingTracking('');
      setUnsavedPrompt(null);
      return;
    }

    if (configDirty) {
      setConfigMonth(savedConfigSnapshot.course_month);
      setConfigYear(savedConfigSnapshot.course_year);
      setOfficialExamStart(savedConfigSnapshot.official_exam_start_local);
      setOfficialExamEnd(savedConfigSnapshot.official_exam_end_local);
      setEnrollmentEnabled(savedConfigSnapshot.enrollment_enabled);
    }
    setManualModalOpen(false);
    setManualDraft(EMPTY_MANUAL_REGISTRATION);
    setManualIdFile(null);
    setSelectedRegistration(null);
    setIsEditingRegistration(false);
    setRegistrationDraft(null);
    setEditingTracking('');
    setUnsavedPrompt(null);
    applyPromptCompletion(intent);
  };

  const handleSaveUnsavedAndProceed = async () => {
    const intent = unsavedPrompt;
    if (!intent) return;

    if (intent.kind === 'close-manual-modal') {
      const ok = await createManualRegistration({ quietSuccess: true });
      if (!ok) return;
      setManualModalOpen(false);
      setManualDraft(EMPTY_MANUAL_REGISTRATION);
      setManualIdFile(null);
      setUnsavedPrompt(null);
      return;
    }

    if (intent.kind === 'close-reg-modal') {
      const idSnap = selectedRegistration?.id;
      const hadTrackingDiff =
        !!idSnap &&
        (editingTracking || '').trim() !== (selectedRegistration?.tracking_number || '').trim();

      if (selectedRegistration && isEditingRegistration && registrationDraft &&
          !registrationDraftMatchesSaved(registrationDraft, selectedRegistration)) {
        const ok = await saveRegistrationEdits();
        if (!ok) return;
      }
      if (hadTrackingDiff && idSnap) {
        const ok = await saveTracking(idSnap);
        if (!ok) return;
      }
      setSelectedRegistration(null);
      setIsEditingRegistration(false);
      setRegistrationDraft(null);
      setEditingTracking('');
      setUnsavedPrompt(null);
      return;
    }

    const idSnap = selectedRegistration?.id;
    const hadTrackingDiff =
      !!idSnap &&
      (editingTracking || '').trim() !== (selectedRegistration?.tracking_number || '').trim();

    if (configDirty) {
      const ok = await persistConfigToServer();
      if (!ok) return;
    }

    if (manualModalOpen && isManualDraftDirty()) {
      const ok = await createManualRegistration({ quietSuccess: true });
      if (!ok) return;
    }

    if (selectedRegistration && isEditingRegistration && registrationDraft &&
        !registrationDraftMatchesSaved(registrationDraft, selectedRegistration)) {
      const ok = await saveRegistrationEdits();
      if (!ok) return;
    }

    if (hadTrackingDiff && idSnap) {
      const ok = await saveTracking(idSnap);
      if (!ok) return;
    }

    setUnsavedPrompt(null);
    applyPromptCompletion(intent);
  };

  const handleCancelUnsavedPrompt = () => {
    setUnsavedPrompt(null);
  };

  const unsavedPromptSaving =
    savingConfig || savingRegistration || manualSaving || savingTracking;

  useEffect(() => {
    if (!isAuthenticated) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasAnyUnsavedWork) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isAuthenticated, hasAnyUnsavedWork]);

  // Si el admin tiene la pestaña de configuración abierta y vuelve a la
  // ventana (cambio de pestaña del navegador, otra sesión actualizó la BD),
  // releemos site_config para que los dropdowns reflejen el valor actual.
  // No lo hacemos si hay cambios sin guardar para no pisar el trabajo.
  useEffect(() => {
    if (!isAuthenticated || activeTab !== 'config') return;
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      if (configDirty) return;
      markStale('config');
      void loadConfig();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, activeTab, configDirty]);

  const officialCertificateAttempt = useMemo(() => {
    if (!selectedRegistration?.id) return null;
    const list = examAttempts.filter(
      (a) =>
        a.registration_id === selectedRegistration.id &&
        a.exam_type === 'oficial' &&
        a.passed === true,
    );
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list[0] ?? null;
  }, [examAttempts, selectedRegistration?.id]);

  const closeCertificateViewer = () => {
    setCertViewerUrl((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return null;
    });
    setCertViewerOpen(false);
    setCertViewerLoading(false);
  };

  const openCertificatePreview = async () => {
    setCertViewerOpen(true);
    setCertViewerLoading(true);
    setCertViewerUrl((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return null;
    });
    try {
      const res = await fetch('/api/admin/certificates/preview', { credentials: 'include' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(typeof err.error === 'string' ? err.error : 'No se pudo generar la vista previa.');
        closeCertificateViewer();
        return;
      }
      const blob = await res.blob();
      setCertViewerUrl(URL.createObjectURL(blob));
    } catch {
      alert('Error de conexión.');
      closeCertificateViewer();
    } finally {
      setCertViewerLoading(false);
    }
  };

  const openCertificateForAttempt = async (attemptId: string) => {
    setCertViewerOpen(true);
    setCertViewerLoading(true);
    setCertViewerUrl((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return null;
    });
    try {
      const res = await fetch('/api/admin/certificates/url', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(typeof data.error === 'string' ? data.error : 'No se pudo obtener el certificado.');
        closeCertificateViewer();
        return;
      }
      setCertViewerUrl(typeof data.signedUrl === 'string' ? data.signedUrl : null);
    } catch {
      alert('Error de conexión.');
      closeCertificateViewer();
    } finally {
      setCertViewerLoading(false);
    }
  };

  const handleAdminCertDownload = async () => {
    if (!certViewerUrl) return;
    try {
      const r = await fetch(certViewerUrl);
      const b = await r.blob();
      const url = URL.createObjectURL(b);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'certificado.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(certViewerUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleAdminCertPrint = () => {
    if (!certViewerUrl) return;
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.src = certViewerUrl;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } finally {
        setTimeout(() => document.body.removeChild(iframe), 500);
      }
    };
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
            <p className="text-gray-600">America&apos;s Boating Club - Boqueron Power Squadron</p>
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
            <button onClick={requestLogout} className="btn-secondary text-sm flex items-center gap-2">
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
              onClick={() => requestTabChange(tab.id)}
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-navy">Matrículas pagadas</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Solo aparecen inscripciones con pago confirmado. Los intentos de pago cancelados no se guardan en la base de datos.
                </p>
              </div>
              <button
                onClick={() => {
                  const hoy = new Date().toISOString().split('T')[0];
                  setManualDraft({
                    ...EMPTY_MANUAL_REGISTRATION,
                    course_name: buildCourseTitle(configMonth, configYear),
                    course_date: hoy,
                  });
                  setManualModalOpen(true);
                }}
                className="btn-primary text-sm inline-flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" /> Nueva matrícula (pago en persona)
              </button>
            </div>

            {registrationsError && (
              <div className="rounded-xl border-2 border-maritime-red/40 bg-maritime-red/10 px-4 py-3 text-maritime-red font-semibold text-sm">
                {registrationsError}
              </div>
            )}

            <p className="text-sm text-gray-600 bg-white/80 rounded-lg px-4 py-3 border border-gray-200">
              <strong>Filtro por sección del curso:</strong> los selectores <em>Mes</em> y <em>Año</em> filtran por{' '}
              <strong>mes y año de la matrícula</strong> (columnas <code className="bg-gray-100 px-1 rounded">course_month</code> /{' '}
              <code className="bg-gray-100 px-1 rounded">course_year</code>).
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

              {/* Botón Reporte DRNA: requiere mes y año específicos */}
              <button
                type="button"
                onClick={async () => {
                  setDrnaButtonError(null);
                  if (filterMonth === 'Todos' || filterYear === 'Todos') {
                    setDrnaButtonError('Selecciona un mes y un año específicos para generar el Reporte DRNA.');
                    return;
                  }
                  if (registrations.length === 0) {
                    setDrnaButtonError('No hay matrículas para el mes y año seleccionados.');
                    return;
                  }
                  // Asegurar que examAttempts esté cargado para calcular notas.
                  if (examAttempts.length === 0) {
                    await loadExams({ silent: true });
                  }
                  setDrnaModalOpen(true);
                }}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-navy text-white hover:bg-navy/90 inline-flex items-center gap-2"
              >
                <FileText className="w-4 h-4" /> Reporte DRNA
              </button>
            </div>

            {drnaButtonError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">
                {drnaButtonError}
              </div>
            )}

            {/* Tabla de matrículas */}
            {registrations.length === 0 && !registrationsError ? (
              <div className="card text-center text-gray-600 py-12 space-y-4">
                <p className="font-semibold text-navy">No hay matrículas con los filtros actuales.</p>
                {(filterMonth !== 'Todos' || filterYear !== 'Todos') ? (
                  <div className="space-y-3">
                    <p className="text-sm">
                      Es posible que la matrícula no tenga mes/año registrados (matrículas manuales antiguas).
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
                      <th className="py-4 px-4 text-left">Mes del curso</th>
                      <th className="py-4 px-4 text-left">Año del curso</th>
                      <th className="py-4 px-4 text-left">Email</th>
                      <th className="py-4 px-4 text-center">Método de Pago</th>
                      <th className="py-4 px-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map(reg => (
                      <tr key={reg.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-semibold">{reg.full_name}</td>
                        <td className="py-3 px-4">{reg.last_name || '—'}</td>
                        <td className="py-3 px-4">{reg.course_month || '—'}</td>
                        <td className="py-3 px-4">{reg.course_year || '—'}</td>
                        <td className="py-3 px-4 text-sm">{reg.email}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-navy/10 text-navy">
                            {formatPaymentMethod(reg.enrollment_source, reg.stripe_checkout_session_id)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => openRegistrationDetails(reg)}
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
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 relative">
              <button
                type="button"
                onClick={requestCloseRegistrationModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center justify-between mb-6 pr-10">
                <h2 className="text-2xl font-bold text-navy">Detalles de Matrícula</h2>
                {!isEditingRegistration ? (
                  <button
                    onClick={() => setIsEditingRegistration(true)}
                    className="btn-secondary text-sm inline-flex items-center gap-2"
                  >
                    <Pencil className="w-4 h-4" /> Editar información
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (!selectedRegistration) return;
                        openRegistrationDetails(selectedRegistration);
                        setIsEditingRegistration(false);
                      }}
                      className="btn-secondary text-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={saveRegistrationEdits}
                      disabled={savingRegistration}
                      className="btn-primary text-sm disabled:opacity-50"
                    >
                      {savingRegistration ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="md:col-span-2 bg-navy/5 rounded-lg p-4 mb-2">
                  <h3 className="font-bold text-navy mb-2">Información del Curso</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-gray-500">Mes del curso:</span>{' '}
                      <span className="font-semibold">{selectedRegistration.course_month || '—'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Año del curso:</span>{' '}
                      <span className="font-semibold">{selectedRegistration.course_year || '—'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Título:</span>{' '}
                      {isEditingRegistration ? (
                        <input
                          type="text"
                          value={registrationDraft?.course_name || ''}
                          onChange={(e) => setRegistrationDraft(prev => prev ? { ...prev, course_name: e.target.value } : null)}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      ) : <span className="font-semibold">{selectedRegistration.course_name || '—'}</span>}
                    </div>
                    <div>
                      <span className="text-gray-500">Fecha Matrícula:</span>{' '}
                      {isEditingRegistration ? (
                        <input
                          type="date"
                          value={registrationDraft?.course_date || ''}
                          onChange={(e) => setRegistrationDraft(prev => prev ? { ...prev, course_date: e.target.value } : null)}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      ) : <span className="font-semibold">{selectedRegistration.course_date || '—'}</span>}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 bg-navy/5 rounded-lg p-4 mb-2">
                  <h3 className="font-bold text-navy mb-2">Datos Personales</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-gray-500">Nombre:</span>{' '}
                      {isEditingRegistration ? (
                        <input type="text" value={registrationDraft?.full_name || ''} onChange={(e) => setRegistrationDraft(prev => prev ? { ...prev, full_name: e.target.value } : null)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      ) : <span className="font-semibold">{selectedRegistration.full_name}</span>}
                    </div>
                    <div>
                      <span className="text-gray-500">Apellido:</span>{' '}
                      {isEditingRegistration ? (
                        <input type="text" value={registrationDraft?.last_name || ''} onChange={(e) => setRegistrationDraft(prev => prev ? { ...prev, last_name: e.target.value } : null)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      ) : <span className="font-semibold">{selectedRegistration.last_name || '—'}</span>}
                    </div>
                    <div>
                      <span className="text-gray-500">Dir. Postal:</span>{' '}
                      {isEditingRegistration ? (
                        <input type="text" value={registrationDraft?.postal_address || ''} onChange={(e) => setRegistrationDraft(prev => prev ? { ...prev, postal_address: e.target.value } : null)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      ) : <span className="font-semibold">{selectedRegistration.postal_address || '—'}</span>}
                    </div>
                    <div>
                      <span className="text-gray-500">Dir. Física:</span>{' '}
                      {isEditingRegistration ? (
                        <input type="text" value={registrationDraft?.physical_address || ''} onChange={(e) => setRegistrationDraft(prev => prev ? { ...prev, physical_address: e.target.value } : null)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      ) : <span className="font-semibold">{selectedRegistration.physical_address || '—'}</span>}
                    </div>
                    <div>
                      <span className="text-gray-500">Ciudad:</span>{' '}
                      {isEditingRegistration ? (
                        <input type="text" value={registrationDraft?.city || ''} onChange={(e) => setRegistrationDraft(prev => prev ? { ...prev, city: e.target.value } : null)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      ) : <span className="font-semibold">{selectedRegistration.city || '—'}</span>}
                    </div>
                    <div>
                      <span className="text-gray-500">País:</span>{' '}
                      {isEditingRegistration ? (
                        <input type="text" value={registrationDraft?.country || ''} onChange={(e) => setRegistrationDraft(prev => prev ? { ...prev, country: e.target.value } : null)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      ) : <span className="font-semibold">{selectedRegistration.country || '—'}</span>}
                    </div>
                    <div>
                      <span className="text-gray-500">Código Postal:</span>{' '}
                      {isEditingRegistration ? (
                        <input type="text" value={registrationDraft?.zip_code || ''} onChange={(e) => setRegistrationDraft(prev => prev ? { ...prev, zip_code: e.target.value } : null)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      ) : <span className="font-semibold">{selectedRegistration.zip_code || '—'}</span>}
                    </div>
                    <div>
                      <span className="text-gray-500">Teléfono:</span>{' '}
                      {isEditingRegistration ? (
                        <input type="tel" value={registrationDraft?.phone || ''} onChange={(e) => setRegistrationDraft(prev => prev ? { ...prev, phone: e.target.value } : null)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      ) : <span className="font-semibold">{selectedRegistration.phone || '—'}</span>}
                    </div>
                    <div>
                      <span className="text-gray-500">Celular:</span>{' '}
                      {isEditingRegistration ? (
                        <input type="tel" value={registrationDraft?.cellphone || ''} onChange={(e) => setRegistrationDraft(prev => prev ? { ...prev, cellphone: e.target.value } : null)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      ) : <span className="font-semibold">{selectedRegistration.cellphone || '—'}</span>}
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>{' '}
                      {isEditingRegistration ? (
                        <input type="email" value={registrationDraft?.email || ''} onChange={(e) => setRegistrationDraft(prev => prev ? { ...prev, email: e.target.value } : null)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      ) : <span className="font-semibold">{selectedRegistration.email}</span>}
                    </div>
                    <div>
                      <span className="text-gray-500">Sexo:</span>{' '}
                      {isEditingRegistration ? (
                        <select value={registrationDraft?.gender || ''} onChange={(e) => setRegistrationDraft(prev => prev ? { ...prev, gender: e.target.value } : null)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg">
                          <option value="">Selecciona...</option>
                          <option value="M">Masculino (M)</option>
                          <option value="F">Femenino (F)</option>
                        </select>
                      ) : <span className="font-semibold">{selectedRegistration.gender || '—'}</span>}
                    </div>
                    <div>
                      <span className="text-gray-500">Fecha Nacimiento:</span>{' '}
                      {isEditingRegistration ? (
                        <input type="date" value={registrationDraft?.birth_date || ''} onChange={(e) => setRegistrationDraft(prev => prev ? { ...prev, birth_date: e.target.value } : null)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      ) : <span className="font-semibold">{selectedRegistration.birth_date || '—'}</span>}
                    </div>
                    <div>
                      <span className="text-gray-500">¿Menor?:</span>{' '}
                      {isEditingRegistration ? (
                        <select
                          value={registrationDraft?.is_minor ? 'si' : 'no'}
                          onChange={(e) => setRegistrationDraft(prev => prev ? { ...prev, is_minor: e.target.value === 'si' } : null)}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="no">No</option>
                          <option value="si">Sí</option>
                        </select>
                      ) : <span className="font-semibold">{selectedRegistration.is_minor ? 'Sí' : 'No'}</span>}
                    </div>
                    {(registrationDraft?.is_minor || selectedRegistration.is_minor) && (
                      <>
                        <div>
                          <span className="text-gray-500">Firma Padre/Tutor:</span>{' '}
                          {isEditingRegistration ? (
                            <input type="text" value={registrationDraft?.parent_guardian_signature || ''} onChange={(e) => setRegistrationDraft(prev => prev ? { ...prev, parent_guardian_signature: e.target.value } : null)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" />
                          ) : <span className="font-semibold">{selectedRegistration.parent_guardian_signature || '—'}</span>}
                        </div>
                        <div>
                          <span className="text-gray-500">Fecha Firma:</span>{' '}
                          {isEditingRegistration ? (
                            <input type="date" value={registrationDraft?.parent_guardian_signed_at || ''} onChange={(e) => setRegistrationDraft(prev => prev ? { ...prev, parent_guardian_signed_at: e.target.value } : null)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" />
                          ) : <span className="font-semibold">{selectedRegistration.parent_guardian_signed_at || '—'}</span>}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-navy/5 rounded-lg p-4">
                  <h3 className="font-bold text-navy mb-2">Características Físicas</h3>
                  <div className="space-y-1">
                    <div>
                      <span className="text-gray-500">Cabello:</span>{' '}
                      {isEditingRegistration ? (
                        <input type="text" value={registrationDraft?.hair_color || ''} onChange={(e) => setRegistrationDraft(prev => prev ? { ...prev, hair_color: e.target.value } : null)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      ) : <span className="font-semibold">{selectedRegistration.hair_color || '—'}</span>}
                    </div>
                    <div>
                      <span className="text-gray-500">Ojos:</span>{' '}
                      {isEditingRegistration ? (
                        <input type="text" value={registrationDraft?.eye_color || ''} onChange={(e) => setRegistrationDraft(prev => prev ? { ...prev, eye_color: e.target.value } : null)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      ) : <span className="font-semibold">{selectedRegistration.eye_color || '—'}</span>}
                    </div>
                    <div>
                      <span className="text-gray-500">Estatura (pies/pulgadas):</span>{' '}
                      {isEditingRegistration ? (
                        <div className="flex gap-2 mt-1">
                          <input type="number" min="3" max="8" value={registrationDraft?.height_feet || ''} onChange={(e) => setRegistrationDraft(prev => prev ? { ...prev, height_feet: e.target.value } : null)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Pies" />
                          <input type="number" min="0" max="11" value={registrationDraft?.height_inches || ''} onChange={(e) => setRegistrationDraft(prev => prev ? { ...prev, height_inches: e.target.value } : null)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Pulgadas" />
                        </div>
                      ) : <span className="font-semibold">{selectedRegistration.height_feet || '—'}&apos; {selectedRegistration.height_inches || '—'}&quot;</span>}
                    </div>
                  </div>
                </div>

                <div className="bg-navy/5 rounded-lg p-4">
                  <h3 className="font-bold text-navy mb-2">Embarcación</h3>
                  <div className="space-y-1">
                    <div>
                      <span className="text-gray-500">Tipo:</span>{' '}
                      {isEditingRegistration ? (
                        <select value={registrationDraft?.boat_type || ''} onChange={(e) => setRegistrationDraft(prev => prev ? { ...prev, boat_type: e.target.value } : null)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg">
                          {BOAT_TYPE_OPTIONS.map(opt => <option key={opt.value || 'empty'} value={opt.value}>{opt.label}</option>)}
                        </select>
                      ) : <span className="font-semibold">{selectedRegistration.boat_type || '—'}</span>}
                    </div>
                    <div>
                      <span className="text-gray-500">Eslora:</span>{' '}
                      {isEditingRegistration ? (
                        <select value={registrationDraft?.boat_length || ''} onChange={(e) => setRegistrationDraft(prev => prev ? { ...prev, boat_length: e.target.value } : null)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg">
                          {BOAT_LENGTH_OPTIONS.map(opt => <option key={opt.value || 'empty'} value={opt.value}>{opt.label}</option>)}
                        </select>
                      ) : <span className="font-semibold">{selectedRegistration.boat_length || '—'}</span>}
                    </div>
                    <div>
                      <span className="text-gray-500">Remolque:</span>{' '}
                      {isEditingRegistration ? (
                        <select value={registrationDraft?.has_trailer || ''} onChange={(e) => setRegistrationDraft(prev => prev ? { ...prev, has_trailer: e.target.value } : null)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg">
                          <option value="">Selecciona...</option>
                          <option value="Si">Sí</option>
                          <option value="No">No</option>
                        </select>
                      ) : <span className="font-semibold">{selectedRegistration.has_trailer || '—'}</span>}
                    </div>
                    <div>
                      <span className="text-gray-500">Experiencia:</span>{' '}
                      {isEditingRegistration ? (
                        <input type="number" min="0" value={registrationDraft?.years_experience || ''} onChange={(e) => setRegistrationDraft(prev => prev ? { ...prev, years_experience: e.target.value } : null)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      ) : <span className="font-semibold">{selectedRegistration.years_experience || '—'} años</span>}
                    </div>
                    <div>
                      <span className="text-gray-500">Motor:</span>{' '}
                      {isEditingRegistration ? (
                        <input type="number" min="0" value={registrationDraft?.motor_power || ''} onChange={(e) => setRegistrationDraft(prev => prev ? { ...prev, motor_power: e.target.value } : null)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      ) : <span className="font-semibold">{selectedRegistration.motor_power || '—'} HP</span>}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 bg-navy/5 rounded-lg p-4">
                  <h3 className="font-bold text-navy mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Documento de Identificación
                  </h3>
                  {selectedRegistration.id_document_url ? (
                    <div className="flex items-center gap-4 flex-wrap">
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
                  {isEditingRegistration && (
                    <div className="mt-3">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,application/pdf"
                        disabled={uploadingRegistrationId}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            await uploadRegistrationIdDocument(selectedRegistration.id, file);
                          }
                          e.target.value = '';
                        }}
                        className="block text-sm"
                      />
                      {uploadingRegistrationId && (
                        <p className="text-sm text-navy mt-2 flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" /> Subiendo documento...
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 bg-navy/5 rounded-lg p-4">
                  <h3 className="font-bold text-navy mb-2">Información de Pago</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div><span className="text-gray-500">Monto Total:</span> <span className="font-bold text-navy">${((selectedRegistration.amount_total_cents || 0) / 100).toFixed(2)}</span></div>
                    <div><span className="text-gray-500">Estado:</span> <span className={`font-bold ${estadoEsPagado(selectedRegistration.payment_status) ? 'text-maritime-green' : 'text-maritime-gold'}`}>{estadoEsPagado(selectedRegistration.payment_status) ? 'Pagada' : 'Pendiente'}</span></div>
                    <div><span className="text-gray-500">Envío Libro:</span> <span className="font-semibold">{selectedRegistration.wants_book_shipping ? 'Sí (+$13.00)' : 'No'}</span></div>
                    <div><span className="text-gray-500">Fecha:</span> <span className="font-semibold">{new Date(selectedRegistration.created_at).toLocaleDateString('es-PR', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                  </div>
                </div>

                <div className="md:col-span-2 bg-navy/5 rounded-lg p-4">
                  <h3 className="font-bold text-navy mb-2 flex items-center gap-2">
                    <Award className="w-4 h-4" /> Certificado oficial (PDF)
                  </h3>
                  {officialCertificateAttempt ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => void openCertificateForAttempt(officialCertificateAttempt.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy/80 text-sm font-semibold"
                      >
                        <Eye className="w-4 h-4" /> Ver certificado
                      </button>
                      {officialCertificateAttempt.certificate_issued_at ? (
                        <span className="text-xs text-gray-600">
                          Emitido:{' '}
                          {new Date(officialCertificateAttempt.certificate_issued_at).toLocaleString('es-PR')}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-600">Se generará el PDF al abrirlo si aún no existe.</span>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm">Sin certificado disponible: no hay examen oficial aprobado para esta matrícula.</p>
                  )}
                </div>

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

        {/* ===== MODAL NUEVA MATRÍCULA MANUAL ===== */}
        {manualModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto pt-20 pb-10 px-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 relative">
              <button
                type="button"
                onClick={requestCloseManualModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-navy mb-4">Nueva matrícula (pago en persona)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input className="input-field" placeholder="Título del curso" value={manualDraft.course_name} onChange={(e) => setManualDraft(prev => ({ ...prev, course_name: e.target.value }))} />
                <input type="date" className="input-field" placeholder="Fecha del curso" value={manualDraft.course_date} onChange={(e) => setManualDraft(prev => ({ ...prev, course_date: e.target.value }))} />
                <input className="input-field" placeholder="Nombre *" value={manualDraft.full_name} onChange={(e) => setManualDraft(prev => ({ ...prev, full_name: e.target.value }))} />
                <input className="input-field" placeholder="Apellido *" value={manualDraft.last_name} onChange={(e) => setManualDraft(prev => ({ ...prev, last_name: e.target.value }))} />
                <input className="input-field" placeholder="Dirección postal" value={manualDraft.postal_address} onChange={(e) => setManualDraft(prev => ({ ...prev, postal_address: e.target.value }))} />
                <input className="input-field" placeholder="Dirección física" value={manualDraft.physical_address} onChange={(e) => setManualDraft(prev => ({ ...prev, physical_address: e.target.value }))} />
                <input className="input-field" placeholder="Ciudad" value={manualDraft.city} onChange={(e) => setManualDraft(prev => ({ ...prev, city: e.target.value }))} />
                <input className="input-field" placeholder="País" value={manualDraft.country} onChange={(e) => setManualDraft(prev => ({ ...prev, country: e.target.value }))} />
                <input className="input-field" placeholder="Código postal" value={manualDraft.zip_code} onChange={(e) => setManualDraft(prev => ({ ...prev, zip_code: e.target.value }))} />
                <input type="tel" className="input-field" placeholder="Teléfono *" value={manualDraft.phone} onChange={(e) => setManualDraft(prev => ({ ...prev, phone: e.target.value }))} />
                <input type="tel" className="input-field" placeholder="Celular" value={manualDraft.cellphone} onChange={(e) => setManualDraft(prev => ({ ...prev, cellphone: e.target.value }))} />
                <input type="email" className="input-field" placeholder="Email *" value={manualDraft.email} onChange={(e) => setManualDraft(prev => ({ ...prev, email: e.target.value }))} />
                <select className="input-field" value={manualDraft.gender} onChange={(e) => setManualDraft(prev => ({ ...prev, gender: e.target.value }))}>
                  <option value="">Sexo *</option>
                  <option value="M">Masculino (M)</option>
                  <option value="F">Femenino (F)</option>
                </select>
                <input type="date" className="input-field" placeholder="Fecha nacimiento *" value={manualDraft.birth_date} onChange={(e) => setManualDraft(prev => ({ ...prev, birth_date: e.target.value }))} />
                <input className="input-field" placeholder="Color de cabello *" value={manualDraft.hair_color} onChange={(e) => setManualDraft(prev => ({ ...prev, hair_color: e.target.value }))} />
                <input className="input-field" placeholder="Color de ojos *" value={manualDraft.eye_color} onChange={(e) => setManualDraft(prev => ({ ...prev, eye_color: e.target.value }))} />
                <input type="number" min="3" max="8" className="input-field" placeholder="Estatura pies *" value={manualDraft.height_feet} onChange={(e) => setManualDraft(prev => ({ ...prev, height_feet: e.target.value }))} />
                <input type="number" min="0" max="11" className="input-field" placeholder="Estatura pulgadas *" value={manualDraft.height_inches} onChange={(e) => setManualDraft(prev => ({ ...prev, height_inches: e.target.value }))} />
                <select className="input-field" value={manualDraft.boat_type} onChange={(e) => setManualDraft(prev => ({ ...prev, boat_type: e.target.value }))}>
                  {BOAT_TYPE_OPTIONS.map(opt => <option key={`manual-boat-type-${opt.value || 'empty'}`} value={opt.value}>{opt.label}</option>)}
                </select>
                <select className="input-field" value={manualDraft.boat_length} onChange={(e) => setManualDraft(prev => ({ ...prev, boat_length: e.target.value }))}>
                  {BOAT_LENGTH_OPTIONS.map(opt => <option key={`manual-boat-length-${opt.value || 'empty'}`} value={opt.value}>{opt.label}</option>)}
                </select>
                <select className="input-field" value={manualDraft.has_trailer} onChange={(e) => setManualDraft(prev => ({ ...prev, has_trailer: e.target.value }))}>
                  <option value="">Remolque</option>
                  <option value="Si">Sí</option>
                  <option value="No">No</option>
                </select>
                <input type="number" min="0" className="input-field" placeholder="Años de experiencia" value={manualDraft.years_experience} onChange={(e) => setManualDraft(prev => ({ ...prev, years_experience: e.target.value }))} />
                <input type="number" min="0" className="input-field" placeholder="Potencia motor" value={manualDraft.motor_power} onChange={(e) => setManualDraft(prev => ({ ...prev, motor_power: e.target.value }))} />
                <input className="input-field" placeholder="Tracking (opcional)" value={manualDraft.tracking_number} onChange={(e) => setManualDraft(prev => ({ ...prev, tracking_number: e.target.value }))} />
              </div>

              <div className="mt-4 flex items-center gap-3">
                <label className="text-sm font-semibold text-navy">Menor de edad</label>
                <select
                  className="input-field max-w-xs"
                  value={manualDraft.is_minor ? 'Si' : 'No'}
                  onChange={(e) => setManualDraft(prev => ({ ...prev, is_minor: e.target.value === 'Si' }))}
                >
                  <option value="Si">Sí</option>
                  <option value="No">No</option>
                </select>
                <label className="text-sm font-semibold text-navy ml-4">Envío de libro (+$13)</label>
                <input
                  type="checkbox"
                  checked={manualDraft.wants_book_shipping}
                  onChange={(e) => setManualDraft(prev => ({ ...prev, wants_book_shipping: e.target.checked }))}
                />
              </div>

              {manualDraft.is_minor && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <input className="input-field" placeholder="Firma padre/tutor *" value={manualDraft.parent_guardian_signature} onChange={(e) => setManualDraft(prev => ({ ...prev, parent_guardian_signature: e.target.value }))} />
                  <input type="date" className="input-field" placeholder="Fecha firma padre/tutor" value={manualDraft.parent_guardian_signed_at} onChange={(e) => setManualDraft(prev => ({ ...prev, parent_guardian_signed_at: e.target.value }))} />
                </div>
              )}

              <div className="mt-4">
                <label className="block text-sm font-semibold text-navy mb-2">Documento de ID (opcional)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={(e) => setManualIdFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" className="btn-secondary text-sm" onClick={requestCloseManualModal}>Cancelar</button>
                <button
                  type="button"
                  className="btn-primary text-sm disabled:opacity-50"
                  onClick={() => void createManualRegistration()}
                  disabled={manualSaving}
                >
                  {manualSaving ? 'Guardando...' : 'Crear matrícula manual'}
                </button>
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
                      <th className="py-4 px-4 text-left">Nombre</th>
                      <th className="py-4 px-4 text-left">Apellido</th>
                      <th className="py-4 px-4 text-left">Mes del curso</th>
                      <th className="py-4 px-4 text-left">Año del curso</th>
                      <th className="py-4 px-6 text-center">Correctas</th>
                      <th className="py-4 px-6 text-center">Incorrectas</th>
                      <th className="py-4 px-6 text-center">Porcentaje</th>
                      <th className="py-4 px-6 text-center">Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examAttempts.map(attempt => (
                      <tr key={attempt.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 font-semibold">{attempt.full_name || attempt.student_name || '—'}</td>
                        <td className="py-4 px-4">{attempt.last_name || '—'}</td>
                        <td className="py-4 px-4">{attempt.course_month || '—'}</td>
                        <td className="py-4 px-4">{attempt.course_year || '—'}</td>
                        <td className="py-4 px-6 text-center text-maritime-green font-bold">{attempt.correct_answers}</td>
                        <td className="py-4 px-6 text-center text-maritime-red font-bold">{attempt.incorrect_answers}</td>
                        <td className="py-4 px-6 text-center font-bold">{attempt.percentage}%</td>
                        <td className="py-4 px-6 text-center">
                          {attempt.passed
                            ? <span className="bg-maritime-green/20 text-maritime-green px-3 py-1 rounded-full text-sm font-bold">Aprobado</span>
                            : <span className="bg-maritime-red/20 text-maritime-red px-3 py-1 rounded-full text-sm font-bold">No Aprobado</span>}
                        </td>
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
            <div className="flex flex-col lg:flex-row gap-8 items-start max-w-5xl">
              <div className="card flex-1 w-full max-w-lg">
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

                  <div className="bg-navy/5 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Vista previa del título:</p>
                    <p className="font-bold text-navy text-lg">Curso Básico De Navegación - {configMonth} - {configYear}</p>
                  </div>
                </div>
              </div>

              <div className="card flex-1 w-full max-w-lg">
                <h2 className="text-xl font-bold text-navy mb-4">Disponibilidad de páginas públicas</h2>
                <p className="text-gray-600 text-sm mb-6">
                  La página de matrícula se puede activar o desactivar. El examen oficial solo estará
                  visible dentro del rango de fechas y horas indicado (hora de Puerto Rico). Fuera de ese
                  rango, la ruta redirige al inicio y se ocultan los enlaces.
                </p>
                <div className="space-y-6">
                  <div>
                    <label className="input-label">Página de Examen Oficial</label>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-600">Inicio</label>
                        <input
                          type="datetime-local"
                          value={officialExamStart}
                          onChange={(e) => setOfficialExamStart(e.target.value)}
                          className="input-field mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Fin</label>
                        <input
                          type="datetime-local"
                          value={officialExamEnd}
                          onChange={(e) => setOfficialExamEnd(e.target.value)}
                          className="input-field mt-1"
                        />
                      </div>
                      <p className="text-sm font-semibold text-navy">
                        Estado:{' '}
                        {examWindowStatus === 'unconfigured'
                          ? 'Sin configurar (oculto)'
                          : examWindowStatus === 'active'
                            ? 'Disponible ahora'
                            : 'Fuera de ventana (oculto)'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Página de Matrícula</label>
                    <select
                      value={enrollmentEnabled ? 'Activada' : 'Desactivada'}
                      onChange={(e) => setEnrollmentEnabled(e.target.value === 'Activada')}
                      className="input-field"
                    >
                      <option value="Activada">Activada</option>
                      <option value="Desactivada">Desactivada</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="card max-w-5xl w-full">
              <h2 className="text-xl font-bold text-navy mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5" /> Vista previa del certificado oficial
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                Genera un PDF de muestra con nombre <strong>Juan Del Pueblo</strong> y fecha{' '}
                <strong>01/01/2026</strong>. No se guarda en el servidor.
              </p>
              <button
                type="button"
                onClick={() => void openCertificatePreview()}
                className="btn-secondary"
              >
                Ver preview del certificado
              </button>
            </div>

            <div className="max-w-5xl space-y-4">
              <button onClick={saveConfig} disabled={savingConfig} className="btn-primary w-full sm:w-auto disabled:opacity-50">
                {savingConfig ? 'Guardando...' : 'Guardar Configuración'}
              </button>
              {configMessage && (
                <p className={`text-sm font-semibold ${configMessage.includes('Error') ? 'text-maritime-red' : 'text-maritime-green'}`}>
                  {configMessage}
                </p>
              )}
            </div>
          </div>
        )}

        <CertificateViewerModal
          open={certViewerOpen}
          pdfUrl={certViewerUrl}
          loading={certViewerLoading}
          homeLabel="Cerrar"
          onDownload={handleAdminCertDownload}
          onPrint={handleAdminCertPrint}
          onHome={closeCertificateViewer}
        />

        <DrnaReportModal
          open={drnaModalOpen}
          filterMonth={filterMonth}
          filterYear={filterYear}
          registrations={registrations.map((r) => ({
            id: r.id,
            full_name: r.full_name,
            last_name: r.last_name,
            birth_date: r.birth_date,
            physical_address: r.physical_address,
            postal_address: r.postal_address,
            city: r.city,
            zip_code: r.zip_code,
          }))}
          examAttempts={examAttempts.map((a) => ({
            id: a.id,
            registration_id: a.registration_id,
            percentage: a.percentage,
            passed: a.passed,
            created_at: a.created_at,
          }))}
          onClose={() => setDrnaModalOpen(false)}
        />

        {unsavedPrompt && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-unsaved-dialog-title"
          >
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-gray-200">
              <h2 id="admin-unsaved-dialog-title" className="text-lg font-bold text-navy">
                Cambios sin guardar
              </h2>
              <p className="text-sm text-gray-600">
                Hay información modificada que aún no se ha guardado. Si sales ahora, esos cambios se
                perderán salvo que los guardes antes.
              </p>
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2">
                <button
                  type="button"
                  className="btn-secondary text-sm"
                  onClick={handleCancelUnsavedPrompt}
                  disabled={unsavedPromptSaving}
                >
                  Continuar Editando
                </button>
                <button
                  type="button"
                  className="btn-secondary text-sm border-maritime-red/40 text-maritime-red hover:bg-maritime-red/5"
                  onClick={handleDiscardUnsaved}
                  disabled={unsavedPromptSaving}
                >
                  Salir sin guardar
                </button>
                <button
                  type="button"
                  className="btn-primary text-sm disabled:opacity-50"
                  onClick={() => void handleSaveUnsavedAndProceed()}
                  disabled={unsavedPromptSaving}
                >
                  {unsavedPromptSaving ? 'Guardando…' : 'Guardar datos'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
