/**
 * COMPONENTE DE PREGUNTA DEL EXAMEN
 * 
 * Este componente muestra una pregunta individual con sus opciones de respuesta.
 * Incluye:
 * - Texto de la pregunta
 * - 4 opciones de respuesta (a, b, c, d)
 * - Indicador visual de la opción seleccionada
 * - Sistema de pistas (hints) cuando está activado
 */

'use client';

import { ExamQuestion as ExamQuestionType } from '@/data/examQuestions';
import { Lightbulb } from 'lucide-react';

/**
 * PROPS (Propiedades) DEL COMPONENTE
 */
interface ExamQuestionProps {
  question: ExamQuestionType; // Objeto con la pregunta completa
  questionNumber: number; // Número de la pregunta actual (ej: 5)
  totalQuestions: number; // Total de preguntas (ej: 75)
  selectedAnswer?: number; // Índice de la respuesta seleccionada (si existe)
  onAnswerSelect: (answerIndex: number) => void; // Función que se ejecuta al seleccionar una respuesta
  showHint: boolean; // Si se debe mostrar la pista o no
}

export default function ExamQuestion({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  showHint,
}: ExamQuestionProps) {
  /**
   * Array de letras para las opciones (a, b, c, d)
   */
  const optionLetters = ['a', 'b', 'c', 'd'];

  return (
    <div className="card">
      {/* 
        ==================
        ENCABEZADO DE LA PREGUNTA
        ==================
      */}
      <div className="mb-6">
        {/* Número de pregunta */}
        <div className="text-sm font-semibold text-navy/60 mb-2">
          Pregunta {questionNumber} de {totalQuestions}
        </div>
        
        {/* Texto de la pregunta */}
        <h2 className="text-2xl font-bold text-navy leading-relaxed">
          {question.question}
        </h2>
      </div>

      {/* 
        ==================
        OPCIONES DE RESPUESTA
        ==================
      */}
      <div className="space-y-4">
        {question.options.map((option, index) => {
          // Determinar si esta opción está seleccionada
          const isSelected = selectedAnswer === index;
          
          return (
            <button
              key={index}
              onClick={() => onAnswerSelect(index)}
              className={`
                w-full text-left p-4 rounded-lg border-2 transition-all duration-200
                ${
                  isSelected
                    ? 'border-navy bg-navy text-white shadow-lg'
                    : 'border-gray-300 bg-white hover:border-navy hover:shadow-md'
                }
              `}
            >
              {/* 
                Estructura de cada opción:
                - Letra (a, b, c, d) en un círculo
                - Texto de la opción
              */}
              <div className="flex items-start gap-4">
                {/* Círculo con la letra */}
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold
                    ${
                      isSelected
                        ? 'bg-maritime-gold text-navy'
                        : 'bg-gray-100 text-gray-600'
                    }
                  `}
                >
                  {optionLetters[index].toUpperCase()}
                </div>
                
                {/* Texto de la opción */}
                <div className={`flex-1 pt-2 ${isSelected ? 'font-semibold' : ''}`}>
                  {option}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 
        ==================
        SISTEMA DE PISTAS (HINTS)
        ==================
        Solo se muestra si showHint es true Y el estudiante
        ya seleccionó una respuesta
      */}
      {showHint && selectedAnswer !== undefined && (
        <div className="mt-6 bg-maritime-gold/20 border-2 border-maritime-gold rounded-lg p-4">
          <div className="flex gap-3">
            {/* Icono de bombilla */}
            <Lightbulb className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            
            <div>
              <h4 className="font-bold text-gray-800 mb-2">💡 Pista de Ayuda</h4>
              <p className="text-gray-700 leading-relaxed">
                {question.hint}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 
        ==================
        NOTA INFORMATIVA
        ==================
      */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500 text-center">
          Puedes cambiar tu respuesta en cualquier momento antes de finalizar el examen
        </p>
      </div>
    </div>
  );
}
