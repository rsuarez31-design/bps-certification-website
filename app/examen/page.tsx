/**
 * PÁGINA DEL EXAMEN OFICIAL
 *
 * Examen de certificación bajo la Ley 430 de Puerto Rico.
 * 75 preguntas aleatorias de las 85 disponibles.
 *
 * Características:
 * - Requiere email (se valida contra matrícula pagada)
 * - Máximo 3 intentos en 24 horas tras el pago
 * - Temporizador de 3 horas
 * - Protección de contenido (clic derecho, Ctrl+P, PrintScreen)
 * - Bloqueo en dispositivos móviles (< 768px)
 * - Si tiene 10+ incorrectas, aviso y 1 reintento por pregunta
 * - Si reprueba, muestra preguntas falladas SIN la respuesta correcta
 * - Los resultados se guardan en Supabase
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ExamQuestion } from '@/data/examQuestions';
import { cargarPreguntas, mezclarPreguntas } from '@/lib/questions-loader';
import ExamQuestionComponent from '@/components/ExamQuestion';
import ExamProgress from '@/components/ExamProgress';
import { supabase } from '@/lib/supabase-client';
import { ClipboardList, AlertCircle, XCircle, Award, RotateCcw, Download, Loader2, Monitor, Timer } from 'lucide-react';

interface StudentAnswers {
  [questionId: number]: number;
}

// Datos de reintento activo para una pregunta específica
interface ReintentoActivo {
  questionId: number;
  opcionInicial: number;
}

export default function ExamenPage() {
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

    if (timerRef.current) clearInterval(timerRef.current);

    let correct = 0;
    let incorrect = 0;
    questions.forEach((q) => {
      const a = studentAnswers[q.id];
      if (a === q.correctAnswer) correct++;
      else if (a !== undefined) incorrect++;
    });

    const unanswered = questions.length - correct - incorrect;
    const percentage = Math.round((correct / questions.length) * 100);
    const passed = percentage >= 80;

    setResults({ correct, incorrect, unanswered, percentage, passed, tiempoExpirado: autoFinalizado });
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

    // Guardar en Supabase
    try {
      const { data: attempt } = await supabase
        .from('exam_attempts')
        .insert({
          student_name: studentName,
          student_email: studentEmail.trim().toLowerCase(),
          registration_id: registrationId || null,
          exam_type: 'oficial',
          total_questions: questions.length,
          correct_answers: correct,
          incorrect_answers: incorrect,
          unanswered,
          percentage,
          passed,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (attempt) {
        const answers = questions
          .filter((q) => studentAnswers[q.id] !== undefined)
          .map((q) => ({
            attempt_id: attempt.id,
            question_id: q.id,
            selected_index: studentAnswers[q.id],
            is_correct: studentAnswers[q.id] === q.correctAnswer,
          }));
        if (answers.length > 0) {
          await supabase.from('exam_attempt_answers').insert(answers);
        }
      }
    } catch (error) {
      console.error('Error al guardar resultados:', error);
    }
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
            <p className="text-gray-500 mb-8">Americas Boating Club - Boqueron Power Squadron</p>

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
            <button onClick={goToPrevious} disabled={currentQuestionIndex === 0} className="btn-secondary disabled:opacity-30">← Anterior</button>
            {currentQuestionIndex === questions.length - 1 ? (
              <button onClick={() => finishExam(false)} className="bg-maritime-green text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors">Finalizar Examen</button>
            ) : (
              <button onClick={goToNext} className="btn-primary">Siguiente →</button>
            )}
          </div>

          <div className="mt-8 text-center text-gray-600">
            <p>Preguntas respondidas: <strong>{answeredCount}</strong> de <strong>{questions.length}</strong></p>
          </div>
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
              <p className="text-xl text-gray-600 mb-8">Has demostrado tu conocimiento en navegación segura. Tu certificado está listo.</p>
            ) : (
              <p className="text-xl text-gray-600 mb-8">Necesitas al menos 80% para aprobar. Revisa las preguntas que fallaste y vuelve a intentar.</p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {results.passed && (
                <button onClick={() => window.print()} className="btn-primary">
                  <Download className="w-5 h-5 inline mr-2" /> Descargar Certificado
                </button>
              )}
              <button onClick={restartExam} className="btn-secondary">
                <RotateCcw className="w-5 h-5 inline mr-2" />
                {results.passed ? 'Intentar Otro Examen' : 'Tomar el Examen de Nuevo'}
              </button>
            </div>
          </div>

          {/* Certificado (solo si aprobó) */}
          {results.passed && (
            <div className="card mb-8 print:shadow-none">
              <div className="border-8 border-navy rounded-lg p-12 bg-white">
                <div className="text-center mb-8">
                  <div className="w-24 h-24 bg-navy rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-16 h-16 text-maritime-gold" />
                  </div>
                  <h2 className="text-4xl font-bold text-navy mb-2">Certificado de Navegación</h2>
                  <p className="text-xl text-gray-600">Ley 430 de Puerto Rico</p>
                </div>
                <div className="border-t-2 border-maritime-gold mb-8" />
                <div className="text-center space-y-6">
                  <p className="text-lg text-gray-700">Se certifica que</p>
                  <p className="text-4xl font-bold text-navy">{studentName}</p>
                  <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
                    ha completado satisfactoriamente el Curso de Navegación Segura y ha aprobado
                    el examen oficial con una calificación de <strong>{results.percentage}%</strong>,
                    cumpliendo con los requisitos establecidos por el Departamento de Recursos
                    Naturales y Ambientales de Puerto Rico.
                  </p>
                  <div className="pt-8">
                    <p className="text-gray-600">Fecha de Certificación</p>
                    <p className="font-bold text-navy">
                      {new Date().toLocaleDateString('es-PR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="border-t-2 border-maritime-gold mt-8 pt-8" />
                <div className="text-center">
                  <p className="font-bold text-navy text-lg">Americas Boating Club</p>
                  <p className="text-gray-600">Boqueron Power Squadron</p>
                  <p className="text-sm text-gray-500 mt-2">Certificado ID: {Date.now().toString(36).toUpperCase()}</p>
                </div>
              </div>
            </div>
          )}

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
