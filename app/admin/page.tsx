/**
 * PANEL ADMINISTRATIVO
 * 
 * Esta página permite a los administradores ver:
 * - Estadísticas de estudiantes inscritos
 * - Porcentaje de aprobación
 * - Preguntas más falladas
 * - Historial completo de exámenes
 * 
 * Protección: Usuario: BPS, Contraseña: 2026
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  FileText,
  Lock,
  Eye,
  EyeOff,
  BarChart3,
} from 'lucide-react';

/**
 * INTERFACES PARA LOS DATOS
 */
interface ExamResult {
  studentName: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unanswered: number;
  percentage: number;
  passed: boolean;
  completedAt: string;
}

interface StudentRegistration {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  submittedAt: string;
}

export default function AdminPage() {
  /**
   * ============================================
   * ESTADOS DEL COMPONENTE
   * ============================================
   */
  
  // Estado de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Datos del dashboard
  const [examHistory, setExamHistory] = useState<ExamResult[]>([]);
  const [students, setStudents] = useState<StudentRegistration[]>([]);

  /**
   * ============================================
   * FUNCIÓN PARA MANEJAR EL LOGIN
   * ============================================
   */
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Credenciales fijas (en producción, esto debería estar en el backend)
    const ADMIN_USERNAME = 'BPS';
    const ADMIN_PASSWORD = '2026';

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setLoginError('');
      // Guardar sesión en localStorage
      localStorage.setItem('adminSession', 'true');
    } else {
      setLoginError('Usuario o contraseña incorrectos');
    }
  };

  /**
   * ============================================
   * FUNCIÓN PARA CERRAR SESIÓN
   * ============================================
   */
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    localStorage.removeItem('adminSession');
  };

  /**
   * ============================================
   * EFECTO PARA CARGAR DATOS Y VERIFICAR SESIÓN
   * ============================================
   */
  useEffect(() => {
    // Verificar si hay una sesión activa
    const hasSession = localStorage.getItem('adminSession') === 'true';
    if (hasSession) {
      setIsAuthenticated(true);
    }

    // Cargar datos del historial de exámenes
    const history = JSON.parse(localStorage.getItem('examHistory') || '[]');
    setExamHistory(history);

    // Cargar datos de estudiantes inscritos
    const registrations = JSON.parse(localStorage.getItem('students') || '[]');
    setStudents(registrations);
  }, [isAuthenticated]);

  /**
   * ============================================
   * CALCULAR ESTADÍSTICAS
   * ============================================
   */
  const totalExams = examHistory.length;
  const passedExams = examHistory.filter((exam) => exam.passed).length;
  const passRate = totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0;

  // Calcular las preguntas más falladas
  // (Esta es una simulación simplificada)
  const mostFailedQuestions = [
    { questionNumber: 23, topic: 'Reglas de navegación', failRate: 45 },
    { questionNumber: 41, topic: 'Operación de PWC', failRate: 38 },
    { questionNumber: 67, topic: 'Términos náuticos', failRate: 35 },
    { questionNumber: 15, topic: 'Extintores de incendios', failRate: 32 },
    { questionNumber: 72, topic: 'Navegación técnica', failRate: 28 },
  ];

  /**
   * ============================================
   * RENDERIZADO: PANTALLA DE LOGIN
   * ============================================
   */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-ice flex items-center justify-center py-12 px-4">
        <div className="card max-w-md w-full">
          {/* Icono de candado */}
          <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-navy" />
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-navy text-center mb-2">
            Panel Administrativo
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Ingresa tus credenciales para acceder
          </p>

          {/* Formulario de login */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Error de login */}
            {loginError && (
              <div className="bg-maritime-red/10 border-2 border-maritime-red rounded-lg p-4 text-maritime-red text-center">
                {loginError}
              </div>
            )}

            {/* Usuario */}
            <div>
              <label className="input-label">Usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="BPS"
                className="input-field"
                required
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className="input-label">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="2026"
                  className="input-field pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-navy"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Botón de login */}
            <button type="submit" className="btn-primary w-full">
              Iniciar Sesión
            </button>
          </form>

          {/* Nota informativa */}
          <div className="mt-6 p-4 bg-ice rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              🔒 Área restringida solo para administradores
            </p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * ============================================
   * RENDERIZADO: DASHBOARD ADMINISTRATIVO
   * ============================================
   */
  return (
    <div className="min-h-screen bg-ice py-12">
      <div className="container-custom">
        {/* 
          ==========================================
          ENCABEZADO DEL DASHBOARD
          ==========================================
        */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-navy mb-2">
              Panel Administrativo
            </h1>
            <p className="text-xl text-gray-600">
              Vista general del sistema de certificación
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="btn-secondary"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* 
          ==========================================
          TARJETAS DE ESTADÍSTICAS PRINCIPALES
          ==========================================
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Tarjeta 1: Total de Inscritos */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-navy/10 rounded-lg flex items-center justify-center">
                <Users className="w-7 h-7 text-navy" />
              </div>
              <span className="text-sm font-semibold text-gray-600">Total</span>
            </div>
            <div className="text-4xl font-bold text-navy mb-2">{students.length}</div>
            <p className="text-gray-600">Estudiantes Inscritos</p>
          </div>

          {/* Tarjeta 2: Exámenes Tomados */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-maritime-green/10 rounded-lg flex items-center justify-center">
                <FileText className="w-7 h-7 text-maritime-green" />
              </div>
              <span className="text-sm font-semibold text-gray-600">Total</span>
            </div>
            <div className="text-4xl font-bold text-maritime-green mb-2">{totalExams}</div>
            <p className="text-gray-600">Exámenes Completados</p>
          </div>

          {/* Tarjeta 3: Tasa de Aprobación */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-maritime-gold/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-yellow-600" />
              </div>
              <span className="text-sm font-semibold text-gray-600">Promedio</span>
            </div>
            <div className="text-4xl font-bold text-yellow-600 mb-2">{passRate}%</div>
            <p className="text-gray-600">Tasa de Aprobación</p>
          </div>

          {/* Tarjeta 4: Aprobados */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-maritime-green/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-7 h-7 text-maritime-green" />
              </div>
              <span className="text-sm font-semibold text-gray-600">Aprobados</span>
            </div>
            <div className="text-4xl font-bold text-maritime-green mb-2">{passedExams}</div>
            <p className="text-gray-600">de {totalExams} intentos</p>
          </div>
        </div>

        {/* 
          ==========================================
          SECCIÓN: PREGUNTAS MÁS FALLADAS
          ==========================================
        */}
        <div className="card mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-maritime-red/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-maritime-red" />
            </div>
            <h2 className="text-2xl font-bold">Preguntas Más Falladas</h2>
          </div>

          <div className="space-y-4">
            {mostFailedQuestions.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-ice rounded-lg"
              >
                {/* Número de ranking */}
                <div className="w-10 h-10 bg-maritime-red/20 rounded-lg flex items-center justify-center font-bold text-maritime-red">
                  {index + 1}
                </div>

                {/* Información de la pregunta */}
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">
                    Pregunta #{item.questionNumber}
                  </div>
                  <div className="text-sm text-gray-600">{item.topic}</div>
                </div>

                {/* Tasa de fallo */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-maritime-red">
                    {item.failRate}%
                  </div>
                  <div className="text-sm text-gray-600">Tasa de error</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 
          ==========================================
          TABLA: HISTORIAL DE EXÁMENES
          ==========================================
        */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Historial de Exámenes</h2>

          {examHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No hay exámenes registrados todavía</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Encabezados de la tabla */}
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">
                      Estudiante
                    </th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-700">
                      Correctas
                    </th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-700">
                      Incorrectas
                    </th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-700">
                      Porcentaje
                    </th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-700">
                      Estado
                    </th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-700">
                      Fecha
                    </th>
                  </tr>
                </thead>

                {/* Filas de datos */}
                <tbody>
                  {examHistory.map((exam, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-ice transition-colors"
                    >
                      {/* Nombre del estudiante */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-gray-800">
                          {exam.studentName}
                        </div>
                      </td>

                      {/* Correctas */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-maritime-green font-semibold">
                          {exam.correctAnswers}
                        </span>
                      </td>

                      {/* Incorrectas */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-maritime-red font-semibold">
                          {exam.incorrectAnswers}
                        </span>
                      </td>

                      {/* Porcentaje */}
                      <td className="py-4 px-4 text-center">
                        <span className="text-lg font-bold text-navy">
                          {exam.percentage}%
                        </span>
                      </td>

                      {/* Estado (Aprobado/Reprobado) */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                            exam.passed
                              ? 'bg-maritime-green/20 text-maritime-green'
                              : 'bg-maritime-red/20 text-maritime-red'
                          }`}
                        >
                          {exam.passed ? 'Aprobado' : 'Reprobado'}
                        </span>
                      </td>

                      {/* Fecha */}
                      <td className="py-4 px-4 text-center text-gray-600">
                        {new Date(exam.completedAt).toLocaleDateString('es-PR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 
          ==========================================
          TABLA: ESTUDIANTES INSCRITOS
          ==========================================
        */}
        {students.length > 0 && (
          <div className="card mt-8">
            <h2 className="text-2xl font-bold mb-6">Estudiantes Inscritos</h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">
                      Nombre Completo
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">
                      Teléfono
                    </th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-700">
                      Fecha de Inscripción
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b border-gray-100 hover:bg-ice transition-colors"
                    >
                      <td className="py-4 px-4 font-semibold text-gray-800">
                        {student.fullName}
                      </td>
                      <td className="py-4 px-4 text-gray-600">{student.email}</td>
                      <td className="py-4 px-4 text-gray-600">{student.phone}</td>
                      <td className="py-4 px-4 text-center text-gray-600">
                        {new Date(student.submittedAt).toLocaleDateString('es-PR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
