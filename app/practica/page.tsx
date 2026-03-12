/**
 * PÁGINA DE EXAMEN DE PRÁCTICA
 *
 * Esta página permite a los estudiantes practicar con las
 * primeras 10 preguntas del banco de examen.
 * Es gratis y no requiere matrícula.
 *
 * Reglas:
 * - Solo 10 preguntas (las primeras del banco)
 * - Se aprueba con 80% o más (8 de 10 correctas)
 * - Los resultados se guardan en Supabase como tipo "practica"
 */

'use client';

import { useState, useEffect } from 'react';
import { ExamQuestion } from '@/data/examQuestions';
import { cargarPreguntas } from '@/lib/questions-loader';
import ExamQuestionComponent from '@/components/ExamQuestion';
import ExamProgress from '@/components/ExamProgress';
import { supabase } from '@/lib/supabase-client';
import { ClipboardList, CheckCircle2, XCircle, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';

const PASS_PERCENTAGE = 80; // 80% para aprobar

interface StudentAnswers {
  [questionId: number]: number;
}

export default function PracticaPage() {
  // Preguntas para este examen de práctica (las primeras 10)
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);

  // Índice de la pregunta actual (0-9)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Respuestas del estudiante
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswers>({});

  // Estado del examen: no empezó, en progreso, o terminó
  const [examStatus, setExamStatus] = useState<'not-started' | 'in-progress' | 'completed'>('not-started');

  // Nombre del estudiante
  const [studentName, setStudentName] = useState('');

  // Resultados finales
  const [results, setResults] = useState<{
    correct: number;
    incorrect: number;
    percentage: number;
    passed: boolean;
  } | null>(null);

  // Mostrar la revisión de respuestas
  const [showReview, setShowReview] = useState(false);

  // Indicador de carga mientras se obtienen preguntas
  const [cargando, setCargando] = useState(false);

  // --- Iniciar el examen de práctica ---
  const startExam = async () => {
    if (!studentName.trim()) {
      alert('Por favor ingresa tu nombre completo');
      return;
    }
    setCargando(true);
    try {
      const todasLasPreguntas = await cargarPreguntas();
      // Tomar las primeras 10 preguntas para la práctica
      setQuestions(todasLasPreguntas.slice(0, 10));
      setExamStatus('in-progress');
    } catch (err) {
      console.error('Error al cargar preguntas:', err);
      alert('Error al cargar las preguntas. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  // --- Guardar la respuesta que seleccionó el estudiante ---
  const handleAnswer = (questionId: number, answerIndex: number) => {
    setStudentAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  // --- Ir a la siguiente pregunta ---
  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // --- Ir a la pregunta anterior ---
  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // --- Terminar el examen y calcular los resultados ---
  const finishExam = async () => {
    let correct = 0;
    let incorrect = 0;

    questions.forEach((q) => {
      const answer = studentAnswers[q.id];
      if (answer === q.correctAnswer) correct++;
      else if (answer !== undefined) incorrect++;
    });

    const percentage = Math.round((correct / questions.length) * 100);
    const passed = percentage >= PASS_PERCENTAGE;

    setResults({ correct, incorrect, percentage, passed });
    setExamStatus('completed');

    // Guardar el intento en Supabase
    try {
      const { data: attempt } = await supabase
        .from('exam_attempts')
        .insert({
          student_name: studentName,
          exam_type: 'practica',
          total_questions: questions.length,
          correct_answers: correct,
          incorrect_answers: incorrect,
          unanswered: questions.length - correct - incorrect,
          percentage,
          passed,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      // Guardar cada respuesta individual
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
      console.error('Error al guardar resultados de práctica:', error);
    }
  };

  // --- Reiniciar el examen ---
  const restartExam = () => {
    setCurrentQuestionIndex(0);
    setStudentAnswers({});
    setExamStatus('not-started');
    setResults(null);
    setShowReview(false);
  };

  // ===== PANTALLA: NO EMPEZADO =====
  if (examStatus === 'not-started') {
    return (
      <div className="min-h-screen bg-ice pt-28 pb-20">
        <div className="container-custom max-w-2xl">
          <div className="card text-center">
            <div className="w-20 h-20 bg-ocean-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ClipboardList className="w-12 h-12 text-ocean" />
            </div>
            <h1 className="text-4xl font-bold text-navy mb-4">Examen de Práctica</h1>
            <p className="text-xl text-gray-600 mb-8">
              Practica con 10 preguntas del examen de navegación
            </p>

            <div className="bg-ice rounded-lg p-6 mb-8 text-left">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-navy" />
                Información
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>- Este examen tiene <strong>10 preguntas</strong></li>
                <li>- Necesitas <strong>80% o más</strong> para aprobar (8 de 10 correctas)</li>
                <li>- Es solo para práctica, no afecta tu certificación</li>
                <li>- Puedes tomarlo las veces que quieras</li>
              </ul>
            </div>

            <div className="mb-8">
              <label className="input-label text-left">Nombre Completo <span className="text-maritime-red">*</span></label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Ingresa tu nombre completo"
                className="input-field text-lg"
                onKeyDown={(e) => { if (e.key === 'Enter') startExam(); }}
              />
            </div>

            <button onClick={startExam} disabled={cargando} className="btn-primary text-xl px-12 py-4 flex items-center justify-center gap-3 mx-auto">
              {cargando ? <><Loader2 className="w-6 h-6 animate-spin" /> Cargando preguntas...</> : 'Comenzar Práctica'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== PANTALLA: EN PROGRESO =====
  if (examStatus === 'in-progress') {
    const currentQuestion = questions[currentQuestionIndex];
    const answeredCount = Object.keys(studentAnswers).length;
    const progress = (answeredCount / questions.length) * 100;

    return (
      <div className="min-h-screen bg-ice pt-24 pb-12">
        <div className="container-custom max-w-4xl">
          <ExamProgress
            current={currentQuestionIndex + 1}
            total={questions.length}
            answered={answeredCount}
            percentage={progress}
          />

          <ExamQuestionComponent
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            selectedAnswer={studentAnswers[currentQuestion.id]}
            onAnswerSelect={(idx) => handleAnswer(currentQuestion.id, idx)}
            showHint={false}
          />

          <div className="flex justify-between items-center mt-8">
            <button onClick={goToPrevious} disabled={currentQuestionIndex === 0} className="btn-secondary disabled:opacity-30">
              ← Anterior
            </button>
            {currentQuestionIndex === questions.length - 1 ? (
              <button onClick={finishExam} className="bg-maritime-green text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors">
                Finalizar Práctica
              </button>
            ) : (
              <button onClick={goToNext} className="btn-primary">
                Siguiente →
              </button>
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
    return (
      <div className="min-h-screen bg-ice pt-24 pb-12">
        <div className="container-custom max-w-4xl">
          <div className="card text-center mb-8">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${results.passed ? 'bg-maritime-green/20' : 'bg-maritime-red/20'}`}>
              {results.passed ? (
                <CheckCircle2 className="w-16 h-16 text-maritime-green" />
              ) : (
                <XCircle className="w-16 h-16 text-maritime-red" />
              )}
            </div>

            <h1 className={`text-4xl font-bold mb-4 ${results.passed ? 'text-maritime-green' : 'text-maritime-red'}`}>
              {results.passed ? '¡Aprobaste la Práctica!' : 'No Aprobaste la Práctica'}
            </h1>

            <div className="text-6xl font-bold text-navy mb-6">{results.percentage}%</div>

            <div className="grid grid-cols-2 gap-6 mb-8 max-w-md mx-auto">
              <div className="bg-maritime-green/10 rounded-lg p-4">
                <div className="text-3xl font-bold text-maritime-green">{results.correct}</div>
                <p className="text-gray-600">Correctas</p>
              </div>
              <div className="bg-maritime-red/10 rounded-lg p-4">
                <div className="text-3xl font-bold text-maritime-red">{results.incorrect}</div>
                <p className="text-gray-600">Incorrectas</p>
              </div>
            </div>

            <p className="text-xl text-gray-600 mb-8">
              {results.passed
                ? '¡Buen trabajo! Estás preparado para el examen oficial.'
                : 'Necesitas 80% para aprobar. ¡Sigue practicando!'}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={restartExam} className="btn-primary">
                <RotateCcw className="w-5 h-5 inline mr-2" />
                Intentar de Nuevo
              </button>
              <button
                onClick={() => setShowReview(!showReview)}
                className="btn-secondary"
              >
                {showReview ? 'Ocultar' : 'Ver'} Revisión
              </button>
            </div>
          </div>

          {/* Revisión de respuestas */}
          {showReview && (
            <div className="card">
              <h2 className="text-3xl font-bold text-navy mb-6">Revisión de Respuestas</h2>
              <div className="space-y-6">
                {questions.map((question, index) => {
                  const studentAnswer = studentAnswers[question.id];
                  const isCorrect = studentAnswer === question.correctAnswer;
                  const wasAnswered = studentAnswer !== undefined;

                  return (
                    <div key={question.id} className={`p-6 rounded-lg border-2 ${!wasAnswered ? 'border-gray-300 bg-gray-50' : isCorrect ? 'border-maritime-green bg-maritime-green/5' : 'border-maritime-red bg-maritime-red/5'}`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${!wasAnswered ? 'bg-gray-300' : isCorrect ? 'bg-maritime-green' : 'bg-maritime-red'}`}>
                          {!wasAnswered ? <span className="text-white font-bold">?</span> : isCorrect ? <CheckCircle2 className="w-6 h-6 text-white" /> : <XCircle className="w-6 h-6 text-white" />}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-600 mb-2">Pregunta {index + 1}</div>
                          <h3 className="font-bold text-lg text-gray-800 mb-4">{question.question}</h3>
                          <div className="space-y-2">
                            {question.options.map((option, optIndex) => {
                              const isStudentChoice = optIndex === studentAnswer;
                              return (
                                <div key={optIndex} className={`p-3 rounded-lg ${isStudentChoice && !isCorrect ? 'bg-maritime-red/20 border-2 border-maritime-red' : isStudentChoice && isCorrect ? 'bg-maritime-green/20 border-2 border-maritime-green' : 'bg-gray-100'}`}>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold">{['A', 'B', 'C', 'D'][optIndex]})</span>
                                    <span>{option}</span>
                                    {isStudentChoice && isCorrect && <span className="ml-auto text-maritime-green font-bold">Correcta</span>}
                                    {isStudentChoice && !isCorrect && <span className="ml-auto text-maritime-red font-bold">Tu respuesta</span>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
