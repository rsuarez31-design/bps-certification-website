/**
 * PÁGINA PRINCIPAL DEL EXAMEN
 * 
 * Esta página coordina todo el sistema de examen:
 * - Selecciona 75 preguntas aleatorias de las 85 disponibles
 * - Muestra las preguntas una por una con navegación
 * - Guarda las respuestas del estudiante
 * - Calcula la calificación
 * - Muestra el sistema de ayuda si es necesario
 * - Genera certificado si aprueba
 */

'use client';

import { useState, useEffect } from 'react';
import { getRandomQuestions, ExamQuestion } from '@/data/examQuestions';
import ExamQuestionComponent from '@/components/ExamQuestion';
import ExamResults from '@/components/ExamResults';
import ExamProgress from '@/components/ExamProgress';
import { ClipboardList, AlertCircle } from 'lucide-react';

/**
 * INTERFAZ PARA LAS RESPUESTAS DEL ESTUDIANTE
 * Guarda la respuesta seleccionada para cada pregunta
 */
interface StudentAnswers {
  [questionId: number]: number; // questionId -> índice de respuesta seleccionada
}

export default function ExamenPage() {
  /**
   * ============================================
   * ESTADOS DEL COMPONENTE
   * ============================================
   */
  
  // Array de preguntas seleccionadas para este intento
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  
  // Índice de la pregunta actual (0-74)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Respuestas del estudiante { questionId: answerIndex }
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswers>({});
  
  // Indica si el examen está en curso o finalizado
  const [examStatus, setExamStatus] = useState<'not-started' | 'in-progress' | 'completed'>('not-started');
  
  // Información del estudiante
  const [studentName, setStudentName] = useState('');
  
  // Control del sistema de ayuda
  const [showHints, setShowHints] = useState(false);
  
  // Número de respuestas incorrectas (para activar ayuda)
  const [wrongAnswersCount, setWrongAnswersCount] = useState(0);

  /**
   * FUNCIÓN PARA INICIAR EL EXAMEN
   * Se ejecuta cuando el estudiante hace clic en "Comenzar Examen"
   */
  const startExam = () => {
    if (!studentName.trim()) {
      alert('Por favor ingresa tu nombre completo');
      return;
    }

    // Seleccionar 75 preguntas aleatorias de las 85
    const selectedQuestions = getRandomQuestions(75);
    setQuestions(selectedQuestions);
    setExamStatus('in-progress');
    
    // Guardar en localStorage para persistencia
    localStorage.setItem('examQuestions', JSON.stringify(selectedQuestions));
    localStorage.setItem('studentName', studentName);
    localStorage.setItem('examStartTime', new Date().toISOString());
  };

  /**
   * FUNCIÓN PARA MANEJAR LA SELECCIÓN DE UNA RESPUESTA
   * 
   * @param questionId - ID de la pregunta respondida
   * @param answerIndex - Índice de la respuesta seleccionada (0-3)
   */
  const handleAnswer = (questionId: number, answerIndex: number) => {
    // Actualizar las respuestas del estudiante
    const newAnswers = {
      ...studentAnswers,
      [questionId]: answerIndex,
    };
    setStudentAnswers(newAnswers);
    
    // Guardar en localStorage para no perder progreso
    localStorage.setItem('studentAnswers', JSON.stringify(newAnswers));
  };

  /**
   * FUNCIÓN PARA NAVEGAR A LA SIGUIENTE PREGUNTA
   */
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  /**
   * FUNCIÓN PARA NAVEGAR A LA PREGUNTA ANTERIOR
   */
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  /**
   * FUNCIÓN PARA FINALIZAR EL EXAMEN Y CALCULAR LA CALIFICACIÓN
   */
  const finishExam = () => {
    // Verificar que todas las preguntas hayan sido respondidas
    const answeredQuestions = Object.keys(studentAnswers).length;
    
    if (answeredQuestions < questions.length) {
      const unanswered = questions.length - answeredQuestions;
      const confirm = window.confirm(
        `Tienes ${unanswered} preguntas sin responder. ¿Estás seguro de que quieres terminar el examen?`
      );
      if (!confirm) return;
    }

    // Calcular cuántas respuestas correctas tiene el estudiante
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    
    questions.forEach((question) => {
      const studentAnswer = studentAnswers[question.id];
      if (studentAnswer === question.correctAnswer) {
        correctAnswers++;
      } else if (studentAnswer !== undefined) {
        incorrectAnswers++;
      }
    });

    setWrongAnswersCount(incorrectAnswers);
    setExamStatus('completed');
    
    // Guardar resultados
    const results = {
      studentName,
      totalQuestions: questions.length,
      correctAnswers,
      incorrectAnswers,
      unanswered: questions.length - answeredQuestions,
      percentage: Math.round((correctAnswers / questions.length) * 100),
      passed: (correctAnswers / questions.length) >= 0.8, // 80% para aprobar
      completedAt: new Date().toISOString(),
    };
    
    // Guardar en localStorage y en el historial
    localStorage.setItem('lastExamResults', JSON.stringify(results));
    
    // Agregar al historial de exámenes
    const history = JSON.parse(localStorage.getItem('examHistory') || '[]');
    history.push(results);
    localStorage.setItem('examHistory', JSON.stringify(history));
  };

  /**
   * EFECTO PARA ACTIVAR EL SISTEMA DE AYUDA
   * Si el estudiante responde incorrectamente más de 8 preguntas,
   * se activan las pistas (hints)
   */
  useEffect(() => {
    if (examStatus === 'in-progress' && wrongAnswersCount > 8) {
      setShowHints(true);
    }
  }, [wrongAnswersCount, examStatus]);

  /**
   * EFECTO PARA RECUPERAR EL PROGRESO DEL EXAMEN
   * Si el usuario recarga la página, recupera su progreso
   */
  useEffect(() => {
    const savedQuestions = localStorage.getItem('examQuestions');
    const savedAnswers = localStorage.getItem('studentAnswers');
    const savedName = localStorage.getItem('studentName');
    
    if (savedQuestions && savedAnswers && savedName) {
      const shouldRestore = window.confirm(
        'Tienes un examen en progreso. ¿Deseas continuar donde lo dejaste?'
      );
      
      if (shouldRestore) {
        setQuestions(JSON.parse(savedQuestions));
        setStudentAnswers(JSON.parse(savedAnswers));
        setStudentName(savedName);
        setExamStatus('in-progress');
      } else {
        // Limpiar datos guardados
        localStorage.removeItem('examQuestions');
        localStorage.removeItem('studentAnswers');
        localStorage.removeItem('studentName');
        localStorage.removeItem('examStartTime');
      }
    }
  }, []);

  /**
   * FUNCIÓN PARA REINICIAR EL EXAMEN
   */
  const restartExam = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setStudentAnswers({});
    setExamStatus('not-started');
    setStudentName('');
    setShowHints(false);
    setWrongAnswersCount(0);
    
    // Limpiar localStorage
    localStorage.removeItem('examQuestions');
    localStorage.removeItem('studentAnswers');
    localStorage.removeItem('studentName');
    localStorage.removeItem('examStartTime');
  };

  /**
   * ============================================
   * RENDERIZADO CONDICIONAL SEGÚN EL ESTADO
   * ============================================
   */

  // ESTADO: EXAMEN NO INICIADO - Mostrar formulario de inicio
  if (examStatus === 'not-started') {
    return (
      <div className="min-h-screen bg-ice py-20">
        <div className="container-custom max-w-2xl">
          <div className="card text-center">
            {/* Icono */}
            <div className="w-20 h-20 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ClipboardList className="w-12 h-12 text-navy" />
            </div>

            {/* Título */}
            <h1 className="text-4xl font-bold text-navy mb-4">
              Examen de Certificación Ley 430
            </h1>

            <p className="text-xl text-gray-600 mb-8">
              Bienvenido al examen oficial de navegación de Puerto Rico
            </p>

            {/* Información importante */}
            <div className="bg-ice rounded-lg p-6 mb-8 text-left">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-navy" />
                Información Importante
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ El examen contiene <strong>75 preguntas</strong> seleccionadas aleatoriamente</li>
                <li>✓ Necesitas <strong>80% o más</strong> para aprobar (60 respuestas correctas)</li>
                <li>✓ Puedes navegar entre preguntas con los botones Anterior/Siguiente</li>
                <li>✓ Tus respuestas se guardan automáticamente</li>
                <li>✓ Si fallas más de 8 preguntas, se activarán pistas de ayuda</li>
                <li>✓ Al aprobar, recibirás tu certificado digital</li>
              </ul>
            </div>

            {/* Input para nombre del estudiante */}
            <div className="mb-8">
              <label className="input-label text-left">
                Nombre Completo <span className="text-maritime-red">*</span>
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Ingresa tu nombre completo"
                className="input-field text-lg"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') startExam();
                }}
              />
            </div>

            {/* Botón para comenzar */}
            <button
              onClick={startExam}
              className="btn-primary text-xl px-12 py-4"
            >
              Comenzar Examen
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ESTADO: EXAMEN EN PROGRESO - Mostrar preguntas
  if (examStatus === 'in-progress') {
    const currentQuestion = questions[currentQuestionIndex];
    const answeredCount = Object.keys(studentAnswers).length;
    const progress = (answeredCount / questions.length) * 100;

    return (
      <div className="min-h-screen bg-ice py-12">
        <div className="container-custom max-w-4xl">
          {/* Barra de progreso */}
          <ExamProgress
            current={currentQuestionIndex + 1}
            total={questions.length}
            answered={answeredCount}
            percentage={progress}
          />

          {/* Alerta de ayuda activada */}
          {showHints && (
            <div className="bg-maritime-gold/20 border-2 border-maritime-gold rounded-lg p-4 mb-6">
              <p className="text-center font-semibold text-gray-800">
                💡 Sistema de Ayuda Activado: Ahora verás pistas para cada pregunta
              </p>
            </div>
          )}

          {/* Componente de pregunta actual */}
          <ExamQuestionComponent
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            selectedAnswer={studentAnswers[currentQuestion.id]}
            onAnswerSelect={(answerIndex) => handleAnswer(currentQuestion.id, answerIndex)}
            showHint={showHints}
          />

          {/* Botones de navegación */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="btn-secondary disabled:opacity-30"
            >
              ← Anterior
            </button>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={finishExam}
                className="bg-maritime-green text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                Finalizar Examen
              </button>
            ) : (
              <button
                onClick={goToNextQuestion}
                className="btn-primary"
              >
                Siguiente →
              </button>
            )}
          </div>

          {/* Indicador de preguntas respondidas */}
          <div className="mt-8 text-center text-gray-600">
            <p>
              Preguntas respondidas: <strong>{answeredCount}</strong> de <strong>{questions.length}</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ESTADO: EXAMEN COMPLETADO - Mostrar resultados
  if (examStatus === 'completed') {
    return (
      <ExamResults
        questions={questions}
        studentAnswers={studentAnswers}
        studentName={studentName}
        onRestart={restartExam}
      />
    );
  }

  return null;
}
