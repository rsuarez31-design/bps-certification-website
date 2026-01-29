/**
 * COMPONENTE DE RESULTADOS DEL EXAMEN
 * 
 * Muestra los resultados finales del examen y genera el certificado digital.
 * Incluye:
 * - Calificación y porcentaje
 * - Confeti animado si aprueba
 * - Certificado digital con logo BPS
 * - Revisión de respuestas correctas e incorrectas
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { ExamQuestion } from '@/data/examQuestions';
import { CheckCircle2, XCircle, Award, Download, RotateCcw } from 'lucide-react';

/**
 * Importar confetti de forma dinámica para evitar errores de SSR
 */
let confetti: any;
if (typeof window !== 'undefined') {
  import('canvas-confetti').then((module) => {
    confetti = module.default;
  });
}

/**
 * PROPS DEL COMPONENTE
 */
interface ExamResultsProps {
  questions: ExamQuestion[]; // Array de preguntas del examen
  studentAnswers: { [questionId: number]: number }; // Respuestas del estudiante
  studentName: string; // Nombre del estudiante
  onRestart: () => void; // Función para reiniciar el examen
}

export default function ExamResults({
  questions,
  studentAnswers,
  studentName,
  onRestart,
}: ExamResultsProps) {
  /**
   * Referencia al elemento del certificado para descargar
   */
  const certificateRef = useRef<HTMLDivElement>(null);

  /**
   * Estado para controlar la vista de revisión
   */
  const [showReview, setShowReview] = useState(false);

  /**
   * ============================================
   * CALCULAR ESTADÍSTICAS DEL EXAMEN
   * ============================================
   */
  let correctAnswers = 0;
  let incorrectAnswers = 0;
  let unanswered = 0;

  questions.forEach((question) => {
    const studentAnswer = studentAnswers[question.id];
    if (studentAnswer === undefined) {
      unanswered++;
    } else if (studentAnswer === question.correctAnswer) {
      correctAnswers++;
    } else {
      incorrectAnswers++;
    }
  });

  const totalAnswered = correctAnswers + incorrectAnswers;
  const percentage = totalAnswered > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0;
  const passed = percentage >= 80; // 80% para aprobar

  /**
   * ============================================
   * EFECTO PARA LANZAR CONFETI SI APROBÓ
   * ============================================
   */
  useEffect(() => {
    if (passed && confetti) {
      // Configuración del confeti
      const duration = 3000; // 3 segundos
      const end = Date.now() + duration;

      /**
       * Función para lanzar confeti en intervalos
       */
      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#002855', '#FFD700', '#28A745'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#002855', '#FFD700', '#28A745'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [passed]);

  /**
   * ============================================
   * FUNCIÓN PARA DESCARGAR EL CERTIFICADO
   * ============================================
   */
  const downloadCertificate = () => {
    // En una aplicación real, esto generaría un PDF
    // Por ahora, usaremos window.print() para imprimir/guardar como PDF
    window.print();
  };

  /**
   * ============================================
   * RENDERIZADO DEL COMPONENTE
   * ============================================
   */
  return (
    <div className="min-h-screen bg-ice py-12">
      <div className="container-custom max-w-6xl">
        {/* 
          ==========================================
          TARJETA DE RESULTADOS PRINCIPALES
          ==========================================
        */}
        <div className="card text-center mb-8">
          {/* Icono según resultado */}
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
              passed ? 'bg-maritime-green/20' : 'bg-maritime-red/20'
            }`}
          >
            {passed ? (
              <Award className="w-16 h-16 text-maritime-green" />
            ) : (
              <XCircle className="w-16 h-16 text-maritime-red" />
            )}
          </div>

          {/* Título según resultado */}
          <h1
            className={`text-4xl font-bold mb-4 ${
              passed ? 'text-maritime-green' : 'text-maritime-red'
            }`}
          >
            {passed ? '¡Felicitaciones! Has Aprobado' : 'No Aprobaste Esta Vez'}
          </h1>

          {/* Porcentaje */}
          <div className="text-6xl font-bold text-navy mb-6">{percentage}%</div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 max-w-2xl mx-auto">
            {/* Correctas */}
            <div className="bg-maritime-green/10 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-maritime-green" />
                <span className="font-semibold text-gray-700">Correctas</span>
              </div>
              <div className="text-3xl font-bold text-maritime-green">{correctAnswers}</div>
            </div>

            {/* Incorrectas */}
            <div className="bg-maritime-red/10 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-maritime-red" />
                <span className="font-semibold text-gray-700">Incorrectas</span>
              </div>
              <div className="text-3xl font-bold text-maritime-red">{incorrectAnswers}</div>
            </div>

            {/* Sin Responder */}
            <div className="bg-gray-300/50 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="w-5 h-5 flex items-center justify-center text-gray-600">?</span>
                <span className="font-semibold text-gray-700">Sin Responder</span>
              </div>
              <div className="text-3xl font-bold text-gray-600">{unanswered}</div>
            </div>
          </div>

          {/* Mensaje según resultado */}
          <p className="text-xl text-gray-600 mb-8">
            {passed
              ? 'Has demostrado tu conocimiento en navegación segura. Tu certificado está listo.'
              : `Necesitas al menos 80% para aprobar (60 de 75 preguntas correctas). Inténtalo nuevamente.`}
          </p>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {passed && (
              <button onClick={downloadCertificate} className="btn-primary">
                <Download className="w-5 h-5 inline mr-2" />
                Descargar Certificado
              </button>
            )}

            <button onClick={onRestart} className="btn-secondary">
              <RotateCcw className="w-5 h-5 inline mr-2" />
              {passed ? 'Intentar Otro Examen' : 'Intentar Nuevamente'}
            </button>

            <button
              onClick={() => setShowReview(!showReview)}
              className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:border-navy hover:text-navy transition-colors"
            >
              {showReview ? 'Ocultar' : 'Ver'} Revisión Detallada
            </button>
          </div>
        </div>

        {/* 
          ==========================================
          CERTIFICADO DIGITAL (Solo si aprobó)
          ==========================================
        */}
        {passed && (
          <div ref={certificateRef} className="card mb-8 print:shadow-none">
            <div className="border-8 border-navy rounded-lg p-12 bg-white">
              {/* Encabezado del certificado */}
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-navy rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-16 h-16 text-maritime-gold" />
                </div>
                <h2 className="text-4xl font-bold text-navy mb-2">
                  Certificado de Navegación
                </h2>
                <p className="text-xl text-gray-600">Ley 430 de Puerto Rico</p>
              </div>

              {/* Línea decorativa */}
              <div className="border-t-2 border-maritime-gold mb-8" />

              {/* Cuerpo del certificado */}
              <div className="text-center space-y-6">
                <p className="text-lg text-gray-700">Se certifica que</p>

                <p className="text-4xl font-bold text-navy">{studentName}</p>

                <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
                  ha completado satisfactoriamente el Curso de Navegación Segura y ha aprobado
                  el examen oficial con una calificación de <strong>{percentage}%</strong>,
                  cumpliendo con los requisitos establecidos por el Departamento de Recursos
                  Naturales y Ambientales de Puerto Rico.
                </p>

                <div className="pt-8">
                  <p className="text-gray-600">Fecha de Certificación</p>
                  <p className="font-bold text-navy">
                    {new Date().toLocaleDateString('es-PR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Línea decorativa */}
              <div className="border-t-2 border-maritime-gold mt-8 pt-8" />

              {/* Pie del certificado */}
              <div className="text-center">
                <p className="font-bold text-navy text-lg">Americas Boating Club</p>
                <p className="text-gray-600">Boqueron Power Squadron</p>
                <p className="text-sm text-gray-500 mt-2">
                  Certificado ID: {Date.now().toString(36).toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 
          ==========================================
          REVISIÓN DETALLADA DE RESPUESTAS
          ==========================================
        */}
        {showReview && (
          <div className="card">
            <h2 className="text-3xl font-bold text-navy mb-6">Revisión Detallada</h2>

            <div className="space-y-6">
              {questions.map((question, index) => {
                const studentAnswer = studentAnswers[question.id];
                const isCorrect = studentAnswer === question.correctAnswer;
                const wasAnswered = studentAnswer !== undefined;

                return (
                  <div
                    key={question.id}
                    className={`p-6 rounded-lg border-2 ${
                      !wasAnswered
                        ? 'border-gray-300 bg-gray-50'
                        : isCorrect
                        ? 'border-maritime-green bg-maritime-green/5'
                        : 'border-maritime-red bg-maritime-red/5'
                    }`}
                  >
                    {/* Encabezado de la pregunta */}
                    <div className="flex items-start gap-4 mb-4">
                      {/* Icono según resultado */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          !wasAnswered
                            ? 'bg-gray-300'
                            : isCorrect
                            ? 'bg-maritime-green'
                            : 'bg-maritime-red'
                        }`}
                      >
                        {!wasAnswered ? (
                          <span className="text-white font-bold">?</span>
                        ) : isCorrect ? (
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        ) : (
                          <XCircle className="w-6 h-6 text-white" />
                        )}
                      </div>

                      {/* Texto de la pregunta */}
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-600 mb-2">
                          Pregunta {index + 1}
                        </div>
                        <h3 className="font-bold text-lg text-gray-800 mb-4">
                          {question.question}
                        </h3>

                        {/* Opciones */}
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => {
                            const isCorrectOption = optIndex === question.correctAnswer;
                            const isStudentChoice = optIndex === studentAnswer;

                            return (
                              <div
                                key={optIndex}
                                className={`p-3 rounded-lg ${
                                  isCorrectOption
                                    ? 'bg-maritime-green/20 border-2 border-maritime-green'
                                    : isStudentChoice
                                    ? 'bg-maritime-red/20 border-2 border-maritime-red'
                                    : 'bg-gray-100'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-bold">
                                    {['a', 'b', 'c', 'd'][optIndex].toUpperCase()})
                                  </span>
                                  <span>{option}</span>
                                  {isCorrectOption && (
                                    <span className="ml-auto text-maritime-green font-bold">
                                      ✓ Correcta
                                    </span>
                                  )}
                                  {isStudentChoice && !isCorrectOption && (
                                    <span className="ml-auto text-maritime-red font-bold">
                                      ✗ Tu respuesta
                                    </span>
                                  )}
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
