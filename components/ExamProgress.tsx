/**
 * COMPONENTE DE PROGRESO DEL EXAMEN
 * 
 * Muestra una barra visual del progreso del estudiante en el examen.
 * Incluye:
 * - Barra de progreso animada
 * - Número de preguntas respondidas
 * - Porcentaje de completitud
 */

'use client';

interface ExamProgressProps {
  current: number; // Pregunta actual (1-75)
  total: number; // Total de preguntas (75)
  answered: number; // Cantidad de preguntas respondidas
  percentage: number; // Porcentaje de progreso (0-100)
}

export default function ExamProgress({
  current,
  total,
  answered,
  percentage,
}: ExamProgressProps) {
  return (
    <div className="card mb-8">
      {/* 
        ==================
        INFORMACIÓN DE PROGRESO
        ==================
      */}
      <div className="flex justify-between items-center mb-4">
        {/* Pregunta actual */}
        <div>
          <h3 className="font-semibold text-gray-600">Pregunta Actual</h3>
          <p className="text-2xl font-bold text-navy">
            {current} <span className="text-gray-400">/ {total}</span>
          </p>
        </div>

        {/* Preguntas respondidas */}
        <div className="text-right">
          <h3 className="font-semibold text-gray-600">Respondidas</h3>
          <p className="text-2xl font-bold text-maritime-green">
            {answered} <span className="text-gray-400">/ {total}</span>
          </p>
        </div>
      </div>

      {/* 
        ==================
        BARRA DE PROGRESO
        ==================
      */}
      <div className="space-y-2">
        {/* Contenedor de la barra */}
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          {/* Barra de progreso animada */}
          <div
            className="h-full bg-gradient-to-r from-navy to-navy-light transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Texto del porcentaje */}
        <div className="text-right">
          <span className="text-sm font-semibold text-gray-600">
            {Math.round(percentage)}% Completado
          </span>
        </div>
      </div>

      {/* 
        ==================
        ADVERTENCIA SI FALTAN MUCHAS PREGUNTAS
        ==================
      */}
      {answered < total * 0.5 && answered > 0 && (
        <div className="mt-4 text-sm text-gray-600 bg-ice rounded-lg p-3 text-center">
          ⚠️ Aún quedan {total - answered} preguntas por responder
        </div>
      )}
    </div>
  );
}
