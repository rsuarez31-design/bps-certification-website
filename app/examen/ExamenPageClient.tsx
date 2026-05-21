/**
 * PÁGINA DEL EXAMEN OFICIAL
 *
 * Examen de certificación bajo la Ley 430 de Puerto Rico.
 * Las 75 preguntas del banco en orden aleatorio (Fisher-Yates).
 * El orden se re-mezcla en CADA intento: si el estudiante reintenta el
 * examen, recibe otra permutación distinta de las mismas 75.
 *
 * Características:
 * - Requiere email (se valida contra matrícula pagada)
 * - Máximo 3 intentos en 24 horas tras el pago
 * - Temporizador de 3 horas
 * - Protección de contenido (clic derecho, Ctrl+P, PrintScreen)
 * - Bloqueo en dispositivos móviles (< 768px)
 * - Si tiene 10+ incorrectas, aviso y 1 reintento por pregunta
 * - Si reprueba, muestra preguntas falladas SIN la respuesta correcta
 * - Los resultados del examen oficial se calculan y guardan en el servidor (POST /api/exam/submit).
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ExamQuestion } from '@/data/examQuestions';
import { cargarPreguntas, mezclarPreguntas } from '@/lib/questions-loader';
import ExamQuestionComponent from '@/components/ExamQuestion';
import ExamProgress from '@/components/ExamProgress';
import CertificateViewerModal from '@/components/CertificateViewerModal';
import { ClipboardList, AlertCircle, XCircle, Award, RotateCcw, Loader2, Monitor, Timer } from 'lucide-react';

interface StudentAnswers {
  [questionId: number]: number;
}

// Datos de reintento activo para una pregunta específica
interface ReintentoActivo {
  questionId: number;
  opcionInicial: number;
}

export default function ExamenPageClient() {
  const router = useRouter();
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswers>({});
  const [examStatus, setExamStatus] = useState<'not-started' | 'in-progress' | 'completed'>('not-started');

  // Datos del estudiante
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [registrationId, setRegistrationId] = useState('');
  const [attemptsUsed, setAttemptsUsed] = useState(0);

  // Error de validación de acceso
  const [accessError, setAccessError] = useState('');
  const [validatingAccess, setValidatingAccess] = useState(false);

  // Contador de incorrectas en tiempo real
  const [wrongCount, setWrongCount] = useState(0);

  // Reintento activo (nueva lógica: 10+ incorrectas → 1 reintento por pregunta)
  const [reintentoActivo, setReintentoActivo] = useState<ReintentoActivo | null>(null);
  const [mensajeReintento, setMensajeReintento] = useState<string | null>(null);

  // Temporizador de 3 horas (10800 segundos)
  const [tiempoRestante, setTiempoRestante] = useState(3 * 60 * 60);
  const [tiempoExpirado, setTiempoExpirado] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Bloqueo de dispositivos móviles
  const [isMobile, setIsMobile] = useState(false);

  // Resultados finales
  const [results, setResults] = useState<{
    correct: number;
    incorrect: number;
    unanswered: number;
    percentage: number;
    passed: boolean;
    tiempoExpirado: boolean;
  } | null>(null);

  const [cargando, setCargando] = useState(false);
  const confettiRef = useRef<any>(null);

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);
  const [certificateViewerOpen, setCertificateViewerOpen] = useState(false);
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [submittingExam, setSubmittingExam] = useState(false);
  const [submitExamError, setSubmitExamError] = useState('');
  const [documentosBpsLoading, setDocumentosBpsLoading] = useState(false);
  const [documentosBpsError, setDocumentosBpsError] = useState<string | null>(null);

  // Cargar confetti
  useEffect(() => {
    import('canvas-confetti').then((m) => { confettiRef.current = m.default; });
  }, []);

  // Detectar si es dispositivo móvil (< 768px)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Protección de contenido durante el examen (best-effort, se puede evadir)
  useEffect(() => {
    if (examStatus !== 'in-progress') return;

    const bloquearContextMenu = (e: Event) => e.preventDefault();
    const bloquearTeclas = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        alert('La impresión no está permitida durante el examen.');
      }
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        alert('Las capturas de pantalla no están permitidas durante el examen.');
      }
    };

    document.addEventListener('contextmenu', bloquearContextMenu);
    document.addEventListener('keydown', bloquearTeclas);

    return () => {
      document.removeEventListener('contextmenu', bloquearContextMenu);
      document.removeEventListener('keydown', bloquearTeclas);
    };
  }, [examStatus]);

  // Temporizador: se inicia al comenzar el examen
  useEffect(() => {
    if (examStatus !== 'in-progress') return;

    timerRef.current = setInterval(() => {
      setTiempoRestante(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setTiempoExpirado(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [examStatus]);

  // Auto-finalizar si el tiempo expira
  useEffect(() => {
    if (tiempoExpirado && examStatus === 'in-progress') {
      finishExam(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiempoExpirado]);

  // Formatear tiempo como HH:MM:SS
  const formatearTiempo = (segundos: number): string => {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calcular incorrectas en tiempo real
  const recalcWrongCount = useCallback((answers: StudentAnswers, qs: ExamQuestion[]) => {
    let count = 0;
    qs.forEach((q) => {
      const a = answers[q.id];
      if (a !== undefined && a !== q.correctAnswer) count++;
    });
    setWrongCount(count);
    return count;
  }, []);

  // Validar acceso y comenzar examen
  const startExam = async () => {
    if (!studentName.trim()) { setAccessError('Por favor ingresa tu nombre completo.'); return; }
    if (!studentEmail.trim()) { setAccessError('Por favor ingresa tu correo electrónico.'); return; }

    setAccessError('');
    setValidatingAccess(true);

    try {
      const res = await fetch('/api/exam/validate-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: studentEmail.trim().toLowerCase() }),
      });
      const data = await res.json();

      if (!data.allowed) {
        setAccessError(data.reason);
        setValidatingAccess(false);
        return;
      }

      setAttemptsUsed(data.attemptsUsed || 0);
      setRegistrationId(data.registrationId || '');

      setCargando(true);
      const todasLasPreguntas = await cargarPreguntas();
      // IMPORTANTE: la mezcla corre dentro de esta funcion de inicio del examen.
      // Cada intento (incluidos los reintentos dentro de las 24h) vuelve a pasar
      // por aqui y genera una permutacion Fisher-Yates nueva de las 75 preguntas.
      // No se cachea el orden en sessionStorage/localStorage a proposito.
      const selected = mezclarPreguntas(todasLasPreguntas, 75);
      setQuestions(selected);
      setTiempoRestante(3 * 60 * 60);
      setTiempoExpirado(false);
      setExamStatus('in-progress');
    } catch (err) {
      console.error('Error al iniciar examen:', err);
      setAccessError('Error al conectar con el servidor. Intenta de nuevo.');
    } finally {
      setValidatingAccess(false);
      setCargando(false);
    }
  };

  // Manejar selección de respuesta (nueva lógica de reintentos)
  const handleAnswer = (questionId: number, answerIndex: number) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    const isCorrect = answerIndex === question.correctAnswer;

    // Si es correcta → aceptar siempre
    if (isCorrect) {
      const newAnswers = { ...studentAnswers, [questionId]: answerIndex };
      setStudentAnswers(newAnswers);
      recalcWrongCount(newAnswers, questions);
      setReintentoActivo(null);
      setMensajeReintento(null);
      return;
    }

    // Es incorrecta y tiene 10+ incorrectas → activar reintento
    if (wrongCount >= 10) {
      // Si ya hay un reintento activo para ESTA pregunta
      if (reintentoActivo && reintentoActivo.questionId === questionId) {
        if (answerIndex === reintentoActivo.opcionInicial) {
          setMensajeReintento('Tu respuesta es incorrecta. Tienes 1 oportunidad más para esta pregunta.');
          return;
        }
        // Es diferente a la opción inicial → aceptar el segundo intento
        const newAnswers = { ...studentAnswers, [questionId]: answerIndex };
        setStudentAnswers(newAnswers);
        recalcWrongCount(newAnswers, questions);
        setReintentoActivo(null);
        setMensajeReintento(null);
        return;
      }

      // Primer intento incorrecto en esta pregunta con 10+ → bloquear y dar reintento
      setReintentoActivo({ questionId, opcionInicial: answerIndex });
      setMensajeReintento('Tu respuesta es incorrecta. Tienes 1 oportunidad más para esta pregunta.');
      return;
    }

    // Incorrecta con menos de 10 → aceptar normalmente
    const newAnswers = { ...studentAnswers, [questionId]: answerIndex };
    setStudentAnswers(newAnswers);
    recalcWrongCount(newAnswers, questions);
    setReintentoActivo(null);
    setMensajeReintento(null);
  };

  // Navegación
  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setReintentoActivo(null);
      setMensajeReintento(null);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setReintentoActivo(null);
      setMensajeReintento(null);
    }
  };

  // Finalizar examen
  const finishExam = async (autoFinalizado = false) => {
    if (!autoFinalizado) {
      const answeredCount = Object.keys(studentAnswers).length;
      if (answeredCount < questions.length) {
        const unanswered = questions.length - answeredCount;
        if (!window.confirm(`Tienes ${unanswered} preguntas sin responder. ¿Estás seguro de que quieres terminar?`)) return;
      }
    }

    setSubmittingExam(true);
    setSubmitExamError('');

    try {
      const res = await fetch('/api/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: studentEmail.trim().toLowerCase(),
          registrationId,
          totalQuestions: questions.length,
          questionIds: questions.map((q) => q.id),
          answers: studentAnswers,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setSubmitExamError(typeof data.error === 'string' ? data.error : 'Error al guardar el examen.');
        return;
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const passed = !!data.passed;
      setAttemptId(typeof data.attemptId === 'string' ? data.attemptId : null);
      setResults({
        correct: Number(data.correct) || 0,
        incorrect: Number(data.incorrect) || 0,
        unanswered: Number(data.unanswered) || 0,
        percentage: Number(data.percentage) || 0,
        passed,
        tiempoExpirado: autoFinalizado,
      });
      setExamStatus('completed');

      if (passed && confettiRef.current) {
        const fire = confettiRef.current;
        const end = Date.now() + 3000;
        const frame = () => {
          fire({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#002855', '#FFD700', '#28A745'] });
          fire({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#002855', '#FFD700', '#28A745'] });
          if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();
      }
    } catch {
      setSubmitExamError('Error de conexión al guardar el examen.');
    } finally {
      setSubmittingExam(false);
    }
  };

  const openOfficialCertificate = async () => {
    if (!attemptId) {
      setSubmitExamError('No hay intento registrado para emitir el certificado.');
      return;
    }
    setCertificateViewerOpen(true);
    setCertificateLoading(true);
    setCertificateUrl(null);
    try {
      const res = await fetch('/api/exam/certificate/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId,
          email: studentEmail.trim().toLowerCase(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitExamError(typeof data.error === 'string' ? data.error : 'No se pudo cargar el certificado.');
        setCertificateViewerOpen(false);
        return;
      }
      setCertificateUrl(typeof data.signedUrl === 'string' ? data.signedUrl : null);
    } catch {
      setSubmitExamError('Error de conexión al cargar el certificado.');
      setCertificateViewerOpen(false);
    } finally {
      setCertificateLoading(false);
    }
  };

  const openDocumentosBps = async () => {
    if (!attemptId) {
      setDocumentosBpsError('No hay intento registrado para acceder a los documentos.');
      return;
    }
    setDocumentosBpsLoading(true);
    setDocumentosBpsError(null);
    try {
      const res = await fetch('/api/exam/documentos-bps/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || typeof data.signedUrl !== 'string') {
        setDocumentosBpsError(
          typeof data.error === 'string'
            ? data.error
            : 'No se pudo obtener el enlace de los documentos.',
        );
        return;
      }
      window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
    } catch {
      setDocumentosBpsError('Error de conexión al obtener los documentos.');
    } finally {
      setDocumentosBpsLoading(false);
    }
  };

  const handleCertificateDownload = async () => {
    if (!certificateUrl) return;
    try {
      const r = await fetch(certificateUrl);
      const b = await r.blob();
      const url = URL.createObjectURL(b);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'certificado-oficial.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(certificateUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCertificatePrint = () => {
    if (!certificateUrl) return;
    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.src = certificateUrl;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } finally {
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 500);
      }
    };
  };

  const handleCertificateHome = () => {
    setCertificateViewerOpen(false);
    router.push('/');
  };

  // Reiniciar
  const restartExam = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setStudentAnswers({});
    setExamStatus('not-started');
    setWrongCount(0);
    setReintentoActivo(null);
    setMensajeReintento(null);
    setResults(null);
    setTiempoRestante(3 * 60 * 60);
    setTiempoExpirado(false);
    setAttemptId(null);
    setCertificateUrl(null);
    setCertificateViewerOpen(false);
    setCertificateLoading(false);
    setSubmitExamError('');
  };

  // ===== BLOQUEO MÓVIL =====
  if (isMobile) {
    return (
      <div className="min-h-screen bg-ice pt-28 pb-20 flex items-center justify-center">
        <div className="card max-w-md mx-4 text-center">
          <div className="w-20 h-20 bg-maritime-red/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Monitor className="w-12 h-12 text-maritime-red" />
          </div>
          <h1 className="text-2xl font-bold text-navy mb-4">Dispositivo No Compatible</h1>
          <p className="text-gray-600">
            Este examen solo está disponible en computadoras de escritorio o tablets.
            Por favor, accede desde un dispositivo con pantalla más grande.
          </p>
        </div>
      </div>
    );
  }

  // ===== PANTALLA: NO EMPEZADO =====
  if (examStatus === 'not-started') {
    return (
      <div className="min-h-screen bg-ice pt-28 pb-20">
        <div className="container-custom max-w-2xl">
          <div className="card text-center">
            <div className="w-20 h-20 bg-ocean-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ClipboardList className="w-12 h-12 text-ocean" />
            </div>
            <h1 className="text-4xl font-bold text-navy mb-4">Examen Oficial de Certificación</h1>
            <p className="text-xl text-gray-600 mb-2">Ley 430 de Puerto Rico</p>
            <p className="text-gray-500 mb-8">America&apos;s Boating Club - Boqueron Power Squadron</p>

            <div className="bg-ice rounded-lg p-6 mb-8 text-left">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-navy" /> Información Importante
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>- El examen contiene <strong>75 preguntas</strong> seleccionadas aleatoriamente</li>
                <li>- Necesitas <strong>80% o más</strong> para aprobar (60 respuestas correctas)</li>
                <li>- Tienes un <strong>límite de 3 horas</strong> para completar el examen</li>
                <li>- <strong>Máximo 3 intentos</strong> dentro de las 24 horas después de tu matrícula</li>
                <li>- Al aprobar, recibirás tu certificado digital</li>
              </ul>
            </div>

            {accessError && (
              <div className="bg-maritime-red/10 border-2 border-maritime-red rounded-lg p-4 mb-6">
                <p className="text-maritime-red font-semibold">{accessError}</p>
              </div>
            )}

            <div className="space-y-4 mb-8 text-left">
              <div>
                <label className="input-label">Nombre Completo <span className="text-maritime-red">*</span></label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Ingresa tu nombre completo"
                  className="input-field text-lg"
                />
              </div>
              <div>
                <label className="input-label">Correo Electrónico <span className="text-maritime-red">*</span></label>
                <input
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="El mismo email que usaste en la matrícula"
                  className="input-field text-lg"
                  onKeyDown={(e) => { if (e.key === 'Enter') startExam(); }}
                />
              </div>
            </div>

            <button onClick={startExam} disabled={validatingAccess || cargando} className="btn-primary text-xl px-12 py-4 flex items-center justify-center gap-3 mx-auto disabled:opacity-50">
              {validatingAccess ? <><Loader2 className="w-6 h-6 animate-spin" /> Verificando acceso...</>
                : cargando ? <><Loader2 className="w-6 h-6 animate-spin" /> Cargando preguntas...</>
                : 'Comenzar Examen'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== PANTALLA: EN PROGRESO =====
  if (examStatus === 'in-progress' && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const answeredCount = Object.keys(studentAnswers).length;
    const progress = (answeredCount / questions.length) * 100;
    const ultimos10Min = tiempoRestante <= 600;

    return (
      <div className="min-h-screen bg-ice pt-24 pb-12 exam-protegido">
        <div className="container-custom max-w-4xl">
          {/* Barra superior: progreso + timer + intento */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex-1 min-w-0">
              <ExamProgress
                current={currentQuestionIndex + 1}
                total={questions.length}
                answered={answeredCount}
                percentage={progress}
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Intento {attemptsUsed + 1} de 3</span>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-lg ${
                ultimos10Min ? 'bg-maritime-red/20 text-maritime-red animate-pulse' : 'bg-navy/10 text-navy'
              }`}>
                <Timer className="w-5 h-5" />
                {formatearTiempo(tiempoRestante)}
              </div>
            </div>
          </div>

          {/* Aviso de 10+ incorrectas */}
          {wrongCount >= 10 && (
            <div className="bg-maritime-gold/20 border-2 border-maritime-gold rounded-lg p-4 mb-6 text-center">
              <p className="font-semibold text-gray-800">
                Llevas {wrongCount} respuestas incorrectas. El sistema verificará tus respuestas.
              </p>
            </div>
          )}

          {/* Mensaje de reintento */}
          {mensajeReintento && (
            <div className="bg-maritime-red/20 border-2 border-maritime-red rounded-lg p-4 mb-6 text-center animate-pulse">
              <p className="text-lg font-bold text-maritime-red">{mensajeReintento}</p>
              <p className="text-gray-700 mt-1">Selecciona una opción diferente.</p>
            </div>
          )}

          <ExamQuestionComponent
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            selectedAnswer={studentAnswers[currentQuestion.id]}
            onAnswerSelect={(idx) => handleAnswer(currentQuestion.id, idx)}
            showHint={false}
          />

          <div className="flex justify-between items-center mt-8">
            <button onClick={goToPrevious} disabled={currentQuestionIndex === 0 || submittingExam} className="btn-secondary disabled:opacity-30">← Anterior</button>
            {currentQuestionIndex === questions.length - 1 ? (
              <button
                type="button"
                onClick={() => void finishExam(false)}
                disabled={submittingExam}
                className="bg-maritime-green text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {submittingExam ? 'Enviando…' : 'Finalizar Examen'}
              </button>
            ) : (
              <button type="button" onClick={goToNext} disabled={submittingExam} className="btn-primary disabled:opacity-50">Siguiente →</button>
            )}
          </div>

          {submitExamError && (
            <div className="mt-6 rounded-lg border-2 border-maritime-red bg-maritime-red/10 p-4 text-center space-y-3">
              <p className="text-maritime-red font-semibold">{submitExamError}</p>
              <button
                type="button"
                onClick={() => void finishExam(tiempoRestante <= 0 || tiempoExpirado)}
                className="btn-secondary text-sm"
              >
                Reintentar envío del examen
              </button>
            </div>
          )}

          <div className="mt-8 text-center text-gray-600">
            <p>Preguntas respondidas: <strong>{answeredCount}</strong> de <strong>{questions.length}</strong></p>
          </div>

          {submittingExam && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-xl p-8 shadow-xl flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-navy" aria-hidden />
                <p className="font-semibold text-navy">Guardando resultado en el servidor…</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== PANTALLA: COMPLETADO =====
  if (examStatus === 'completed' && results) {
    const wrongQuestions = questions.filter((q) => {
      const a = studentAnswers[q.id];
      return a !== undefined && a !== q.correctAnswer;
    });

    return (
      <div className="min-h-screen bg-ice pt-24 pb-12">
        <div className="container-custom max-w-6xl">
          {/* Resultados */}
          <div className="card text-center mb-8">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${results.passed ? 'bg-maritime-green/20' : 'bg-maritime-red/20'}`}>
              {results.passed ? <Award className="w-16 h-16 text-maritime-green" /> : <XCircle className="w-16 h-16 text-maritime-red" />}
            </div>

            <h1 className={`text-4xl font-bold mb-4 ${results.passed ? 'text-maritime-green' : 'text-maritime-red'}`}>
              {results.passed ? '¡Felicitaciones! Has Aprobado' : 'No Aprobaste el Examen'}
            </h1>

            {results.tiempoExpirado && (
              <div className="bg-maritime-gold/20 border border-maritime-gold rounded-lg p-3 mb-4 inline-block">
                <p className="font-semibold text-gray-800">El tiempo del examen expiró.</p>
              </div>
            )}

            <div className="text-6xl font-bold text-navy mb-6">{results.percentage}%</div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 max-w-2xl mx-auto">
              <div className="bg-maritime-green/10 rounded-lg p-4">
                <div className="text-3xl font-bold text-maritime-green">{results.correct}</div>
                <p className="text-gray-600">Correctas</p>
              </div>
              <div className="bg-maritime-red/10 rounded-lg p-4">
                <div className="text-3xl font-bold text-maritime-red">{results.incorrect}</div>
                <p className="text-gray-600">Incorrectas</p>
              </div>
              <div className="bg-gray-300/50 rounded-lg p-4">
                <div className="text-3xl font-bold text-gray-600">{results.unanswered}</div>
                <p className="text-gray-600">Sin Responder</p>
              </div>
            </div>

            {results.passed ? (
              <>
                <p className="text-xl text-gray-600 mb-8">
                  Tu certificado oficial está listo en formato PDF. Pulsa el botón para verlo.
                </p>
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => void openOfficialCertificate()}
                    className="btn-primary text-lg px-10 py-4"
                  >
                    Ver Certificado
                  </button>
                </div>

                <div className="mt-10 border-t border-gray-200 pt-8 text-left max-w-2xl mx-auto">
                  <h3 className="text-xl font-bold text-navy mb-3 text-center">
                    Documentos importantes
                  </h3>
                  <p className="text-gray-700 mb-4">
                    En el archivo adjunto encontrarás:
                  </p>
                  <ul className="list-disc list-outside pl-6 space-y-1 text-gray-700 mb-6">
                    <li>Solicitud de licencia de navegación</li>
                    <li>Instrucciones para solicitar la licencia</li>
                    <li>Resumen de la Ley 430</li>
                    <li>Reglamento 6949 de la Ley 430</li>
                  </ul>
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => void openDocumentosBps()}
                      disabled={documentosBpsLoading}
                      className="btn-secondary text-lg px-10 py-4 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {documentosBpsLoading ? 'Generando enlace...' : 'Descargar Documentos'}
                    </button>
                  </div>
                  {documentosBpsError && (
                    <p className="text-maritime-red text-sm mt-3 text-center">
                      {documentosBpsError}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="text-xl text-gray-600 mb-8">Necesitas al menos 80% para aprobar. Revisa las preguntas que fallaste y vuelve a intentar.</p>
                <div className="flex justify-center">
                  <button type="button" onClick={restartExam} className="btn-secondary">
                    <RotateCcw className="w-5 h-5 inline mr-2" />
                    Tomar el Examen de Nuevo
                  </button>
                </div>
              </>
            )}
          </div>

          <CertificateViewerModal
            open={certificateViewerOpen}
            pdfUrl={certificateUrl}
            loading={certificateLoading}
            onDownload={handleCertificateDownload}
            onPrint={handleCertificatePrint}
            onHome={handleCertificateHome}
          />

          {/* Revisión de preguntas falladas (SIN mostrar la respuesta correcta) */}
          {!results.passed && wrongQuestions.length > 0 && (
            <div className="card mb-8">
              <h2 className="text-3xl font-bold text-navy mb-2">Revisión de Preguntas Incorrectas</h2>
              <p className="text-gray-600 mb-6">Aquí puedes ver cuáles preguntas fallaste y cuál fue tu contestación.</p>
              <div className="space-y-6">
                {wrongQuestions.map((question) => {
                  const studentAnswer = studentAnswers[question.id];
                  return (
                    <div key={question.id} className="p-6 rounded-lg border-2 border-maritime-red bg-maritime-red/5">
                      <h3 className="font-bold text-lg text-gray-800 mb-4">{question.question}</h3>
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => {
                          const isStudentChoice = optIndex === studentAnswer;
                          return (
                            <div key={optIndex} className={`p-3 rounded-lg ${isStudentChoice ? 'bg-maritime-red/20 border-2 border-maritime-red' : 'bg-gray-100'}`}>
                              <div className="flex items-center gap-2">
                                <span className="font-bold">{['A', 'B', 'C', 'D'][optIndex]})</span>
                                <span>{option}</span>
                                {isStudentChoice && <span className="ml-auto text-maritime-red font-bold">Tu Contestación</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 text-center">
                <button onClick={restartExam} className="btn-primary text-lg px-10 py-4">
                  <RotateCcw className="w-5 h-5 inline mr-2" /> Tomar el Examen de Nuevo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
