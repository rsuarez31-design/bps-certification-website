/**
 * PÁGINA PRINCIPAL (LANDING PAGE)
 * 
 * Esta es la primera página que ven los visitantes del sitio.
 * Incluye:
 * - Hero Section (sección principal con título impactante)
 * - Información sobre la Ley 430
 * - Características del curso
 * - Call-to-action (botones para inscribirse o tomar el examen)
 */

import Link from 'next/link';
import Image from 'next/image';
import { Anchor, BookOpen, Award, Shield, FileText, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* 
        ============================================
        HERO SECTION - Sección Principal Impactante
        ============================================
      */}
      <section className="wave-effect text-white py-20 sm:py-32">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Columna izquierda: Texto principal */}
            <div className="text-center lg:text-left animate-slide-up">
              {/* Título principal - grande y llamativo */}
              <h1 className="text-5xl sm:text-6xl font-bold mb-6 text-white">
                Certificación Oficial de Navegación
                <span className="block text-maritime-gold mt-2">
                  Ley 430 de Puerto Rico
                </span>
              </h1>
              
              {/* Subtítulo descriptivo */}
              <p className="text-xl sm:text-2xl mb-8 text-ice leading-relaxed">
                Conviértete en un navegante certificado con Americas Boating Club - 
                Boqueron Power Squadron
              </p>
              
              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {/* Botón principal: Inscribirse */}
                <Link 
                  href="/matricula" 
                  className="bg-maritime-gold text-navy px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-400 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Inscríbete Ahora
                </Link>
                
                {/* Botón secundario: Tomar examen */}
                <Link 
                  href="/examen" 
                  className="bg-white text-navy px-8 py-4 rounded-lg font-bold text-lg hover:bg-ice transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Tomar Examen
                </Link>
              </div>
            </div>
            
            {/* Columna derecha: Logo */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md aspect-square">
                <Image
                  src="/images/bps-logo.png"
                  alt="Americas Boating Club - Boqueron Power Squadron Logo"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ============================================
        SECCIÓN: RECURSOS LEGALES - LEY 430
        ============================================
      */}
      <section className="section bg-white">
        <div className="container-custom">
          {/* Encabezado de la sección */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-navy/10 rounded-full mb-4">
              <Shield className="w-8 h-8 text-navy" />
            </div>
            <h2 className="text-4xl font-bold mb-4">Ley 430 de Puerto Rico</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Conoce los requisitos legales para navegar en aguas de Puerto Rico
            </p>
          </div>

          {/* Grid de puntos clave de la ley */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Punto 1: Certificación Obligatoria */}
            <div className="card">
              <div className="w-12 h-12 bg-navy/10 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-navy" />
              </div>
              <h3 className="text-xl font-bold mb-3">Certificación Obligatoria</h3>
              <p className="text-gray-600 leading-relaxed">
                Todo operador de embarcaciones de recreo debe poseer un certificado 
                de navegación aprobado por el Departamento de Recursos Naturales y Ambientales (DRNA).
              </p>
            </div>

            {/* Punto 2: Edad Mínima */}
            <div className="card">
              <div className="w-12 h-12 bg-navy/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-navy" />
              </div>
              <h3 className="text-xl font-bold mb-3">Edad Mínima Requerida</h3>
              <p className="text-gray-600 leading-relaxed">
                Los operadores deben tener al menos 16 años de edad para operar una 
                embarcación de recreo sin supervisión de un adulto certificado.
              </p>
            </div>

            {/* Punto 3: Equipo de Seguridad */}
            <div className="card">
              <div className="w-12 h-12 bg-navy/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-navy" />
              </div>
              <h3 className="text-xl font-bold mb-3">Equipo de Seguridad</h3>
              <p className="text-gray-600 leading-relaxed">
                Todas las embarcaciones deben llevar dispositivos de flotación personal (PFD) 
                aprobados, extintores de incendios y señales de socorro según corresponda.
              </p>
            </div>

            {/* Punto 4: Registro de Embarcaciones */}
            <div className="card">
              <div className="w-12 h-12 bg-navy/10 rounded-lg flex items-center justify-center mb-4">
                <Anchor className="w-6 h-6 text-navy" />
              </div>
              <h3 className="text-xl font-bold mb-3">Registro de Embarcaciones</h3>
              <p className="text-gray-600 leading-relaxed">
                Las embarcaciones deben estar registradas y llevar el número de registro 
                visible en ambos lados de la proa según las especificaciones del DRNA.
              </p>
            </div>

            {/* Punto 5: Operación Responsable */}
            <div className="card">
              <div className="w-12 h-12 bg-navy/10 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-navy" />
              </div>
              <h3 className="text-xl font-bold mb-3">Operación Responsable</h3>
              <p className="text-gray-600 leading-relaxed">
                Está prohibido operar bajo la influencia de alcohol o drogas. 
                El límite legal es 0.08% de concentración de alcohol en la sangre (BAC).
              </p>
            </div>

            {/* Punto 6: Sanciones */}
            <div className="card">
              <div className="w-12 h-12 bg-navy/10 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-navy" />
              </div>
              <h3 className="text-xl font-bold mb-3">Sanciones y Multas</h3>
              <p className="text-gray-600 leading-relaxed">
                Las violaciones a la Ley 430 pueden resultar en multas significativas, 
                suspensión de privilegios de navegación y en casos graves, cargos criminales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ============================================
        SECCIÓN: CARACTERÍSTICAS DEL CURSO
        ============================================
      */}
      <section className="section bg-ice">
        <div className="container-custom">
          {/* Encabezado */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-navy/10 rounded-full mb-4">
              <BookOpen className="w-8 h-8 text-navy" />
            </div>
            <h2 className="text-4xl font-bold mb-4">¿Qué Incluye Nuestro Curso?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Un programa completo diseñado para prepararte como navegante certificado
            </p>
          </div>

          {/* Lista de características */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Característica 1 */}
            <div className="flex gap-4 items-start bg-white p-6 rounded-xl shadow-md">
              <div className="w-10 h-10 bg-maritime-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 text-maritime-green" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Certificación Oficial</h3>
                <p className="text-gray-600">
                  Al aprobar, recibes tu certificado digital oficial reconocido por el DRNA de Puerto Rico.
                </p>
              </div>
            </div>

            {/* Característica 2 */}
            <div className="flex gap-4 items-start bg-white p-6 rounded-xl shadow-md">
              <div className="w-10 h-10 bg-maritime-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-maritime-green" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">85 Preguntas Completas</h3>
                <p className="text-gray-600">
                  Banco de 85 preguntas que cubren todos los temas de navegación segura.
                </p>
              </div>
            </div>

            {/* Característica 3 */}
            <div className="flex gap-4 items-start bg-white p-6 rounded-xl shadow-md">
              <div className="w-10 h-10 bg-maritime-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-maritime-green" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Sistema de Ayuda Inteligente</h3>
                <p className="text-gray-600">
                  Si fallas preguntas, el sistema te ofrece pistas para ayudarte a aprender.
                </p>
              </div>
            </div>

            {/* Característica 4 */}
            <div className="flex gap-4 items-start bg-white p-6 rounded-xl shadow-md">
              <div className="w-10 h-10 bg-maritime-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Anchor className="w-6 h-6 text-maritime-green" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Examen de 75 Preguntas</h3>
                <p className="text-gray-600">
                  Cada intento selecciona 75 preguntas aleatorias del banco completo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ============================================
        SECCIÓN: CALL TO ACTION FINAL
        ============================================
      */}
      <section className="section wave-effect text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            ¿Listo para Comenzar tu Viaje?
          </h2>
          <p className="text-xl sm:text-2xl mb-10 max-w-3xl mx-auto text-ice">
            Únete a miles de navegantes certificados en Puerto Rico. 
            Tu aventura náutica comienza aquí.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              href="/matricula" 
              className="bg-maritime-gold text-navy px-10 py-5 rounded-lg font-bold text-xl hover:bg-yellow-400 transition-all duration-200 shadow-xl hover:shadow-2xl"
            >
              Inscribirme Ahora
            </Link>
            <Link 
              href="/examen" 
              className="border-2 border-white text-white px-10 py-5 rounded-lg font-bold text-xl hover:bg-white hover:text-navy transition-all duration-200 shadow-xl"
            >
              Ver Examen de Práctica
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
