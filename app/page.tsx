/**
 * PÁGINA PRINCIPAL (LANDING PAGE)
 *
 * Página de inicio con estilo tropical caribeño.
 * Incluye: Hero con foto de fondo, contador animado,
 * secciones de Ley 430, características del curso y CTA.
 */

import Link from 'next/link';
import Image from 'next/image';
import {
  Anchor, BookOpen, Award, Shield, FileText, Users,
  ChevronRight, Waves, LifeBuoy, GraduationCap, Ship, Star,
} from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';
import Counter from '@/components/Counter';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* ============================================
          HERO SECTION - Imagen de fondo del Caribe
          ============================================ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Imagen de fondo */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-caribbean.png"
            alt="Mar del Caribe con botes y personas disfrutando"
            fill
            className="object-cover"
            priority
            quality={85}
          />
          {/* Overlay oscuro con gradiente tropical */}
          <div className="absolute inset-0 hero-overlay" />
        </div>

        {/* Contenido del Hero */}
        <div className="relative z-10 container-custom text-center text-white pt-20">
          <AnimatedSection>
            {/* Insignia superior */}
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm
                            px-5 py-2.5 rounded-full mb-8 border border-white/20">
              <Anchor className="w-4 h-4 text-maritime-gold" />
              <span className="text-sm font-semibold text-white/90">
                Certificación Oficial Ley 430 de Puerto Rico
              </span>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight">
              Americas Boating Club
              <span className="block text-gradient mt-2">
                Boquerón Power Squadron
              </span>
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <p className="text-xl sm:text-2xl mb-4 text-white/85 max-w-3xl mx-auto leading-relaxed">
              Navega con confianza y seguridad.
            </p>
            <p className="text-xl sm:text-2xl mb-10 text-white/85 max-w-3xl mx-auto leading-relaxed">
              Obtén tu licencia de navegación para botes, jet skis y embarcaciones.
              Certificación reconocida por el DRNA de Puerto Rico.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/matricula" className="btn-gold">
                Inscríbete Ahora
                <ChevronRight className="inline w-5 h-5 ml-1" />
              </Link>
              <Link
                href="/practica"
                className="bg-white/15 backdrop-blur-sm text-white px-8 py-4 rounded-xl
                           font-bold text-lg hover:bg-white/25 transition-all duration-300
                           border border-white/30 shadow-lg"
              >
                Examen de Práctica Gratis
              </Link>
            </div>
          </AnimatedSection>

          {/* Flecha animada */}
          <div className="mt-16 animate-bounce">
            <Waves className="w-8 h-8 text-white/50 mx-auto" />
          </div>
        </div>

        {/* Ola decorativa en la parte inferior */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" className="w-full h-16 sm:h-20">
            <path
              fill="#ffffff"
              d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z"
            />
          </svg>
        </div>
      </section>

      {/* ============================================
          CONTADOR DE ESTADÍSTICAS
          ============================================ */}
      <section className="py-12 bg-white relative -mt-1">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <AnimatedSection delay={0} className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-ocean mb-2">
                <Counter end={500} suffix="+" />
              </div>
              <p className="text-gray-600 font-medium text-sm sm:text-base">Estudiantes Certificados</p>
            </AnimatedSection>

            <AnimatedSection delay={0.1} className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-navy mb-2">
                <Counter end={85} />
              </div>
              <p className="text-gray-600 font-medium text-sm sm:text-base">Preguntas del Examen</p>
            </AnimatedSection>

            <AnimatedSection delay={0.2} className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-maritime-gold mb-2">
                <Counter end={95} suffix="%" />
              </div>
              <p className="text-gray-600 font-medium text-sm sm:text-base">Tasa de Aprobación</p>
            </AnimatedSection>

            <AnimatedSection delay={0.3} className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-maritime-coral mb-2">
                <Counter end={50} suffix="+" />
              </div>
              <p className="text-gray-600 font-medium text-sm sm:text-base">Años de Experiencia</p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ============================================
          QUÉ INCLUYE NUESTRO CURSO
          ============================================ */}
      <section className="section bg-ice">
        <div className="container-custom">
          <AnimatedSection className="text-center mb-16">
            <span className="badge-ocean mb-4">
              <GraduationCap className="w-4 h-4" />
              Programa Completo
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              ¿Qué Incluye Nuestro Curso?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Todo lo que necesitas para obtener tu certificación de navegación
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <AnimatedSection delay={0}>
              <div className="card-hover flex gap-5 items-start">
                <div className="w-14 h-14 bg-ocean-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Award className="w-7 h-7 text-ocean" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-navy">Certificación Oficial</h3>
                  <p className="text-gray-600">
                    Al aprobar este curso recibes tu certificado digital oficial reconocido por el DRNA de Puerto Rico.
                  </p>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <div className="card-hover flex gap-5 items-start">
                <div className="w-14 h-14 bg-sand-light rounded-2xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-7 h-7 text-maritime-gold" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-navy">Libro De Texto</h3>
                  <p className="text-gray-600">
                    En el libro encontrarás toda la información necesaria para aprobar el curso y referencias para uso futuro.
                  </p>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="card-hover flex gap-5 items-start">
                <div className="w-14 h-14 bg-ocean-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <LifeBuoy className="w-7 h-7 text-ocean" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-navy">Sistema de Ayuda Inteligente</h3>
                  <p className="text-gray-600">
                    Si fallas preguntas, el sistema permitirá asistencia directa de los instructores del curso.
                  </p>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <div className="card-hover flex gap-5 items-start">
                <div className="w-14 h-14 bg-sand-light rounded-2xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-7 h-7 text-maritime-gold" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-navy">Licencia Oficial del DRNA</h3>
                  <p className="text-gray-600">
                    Luego de aprobar el curso, recibirás la información necesaria para gestionar tu licencia en DRNA.
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ============================================
          LEY 430 DE PUERTO RICO
          ============================================ */}
      <section className="section bg-white">
        <div className="container-custom">
          <AnimatedSection className="text-center mb-16">
            <span className="badge-ocean mb-4">
              <Shield className="w-4 h-4" />
              Información Legal
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Ley 430 de Puerto Rico
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Conoce los requisitos legales para navegar en aguas de Puerto Rico
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                title: 'Certificación Obligatoria',
                desc: 'Todo operador de embarcaciones de recreo debe poseer un certificado de navegación aprobado por el DRNA.',
                color: 'ocean',
              },
              {
                icon: Users,
                title: 'Edad Mínima Requerida',
                desc: 'Los operadores deben tener al menos 16 años para operar una embarcación sin supervisión de un adulto certificado.',
                color: 'gold',
              },
              {
                icon: Shield,
                title: 'Equipo de Seguridad',
                desc: 'Todas las embarcaciones deben llevar dispositivos de flotación personal (PFD), extintores y señales de socorro.',
                color: 'ocean',
              },
              {
                icon: Anchor,
                title: 'Registro de Embarcaciones',
                desc: 'Las embarcaciones deben estar registradas y llevar el número de registro visible en ambos lados de la proa.',
                color: 'gold',
              },
              {
                icon: BookOpen,
                title: 'Operación Responsable',
                desc: 'Está prohibido operar bajo la influencia de alcohol o drogas. El límite legal es 0.08% BAC.',
                color: 'ocean',
              },
              {
                icon: Award,
                title: 'Sanciones y Multas',
                desc: 'Las violaciones pueden resultar en multas significativas, suspensión de privilegios y cargos criminales.',
                color: 'gold',
              },
            ].map((item, idx) => (
              <AnimatedSection key={idx} delay={idx * 0.1}>
                <div className="card-hover h-full">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    item.color === 'ocean' ? 'bg-ocean-50' : 'bg-sand-light'
                  }`}>
                    <item.icon className={`w-6 h-6 ${
                      item.color === 'ocean' ? 'text-ocean' : 'text-maritime-gold'
                    }`} />
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-navy">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          PROCESO PASO A PASO
          ============================================ */}
      <section className="section bg-tropical text-white relative overflow-hidden">
        {/* Ola superior */}
        <div className="absolute top-0 left-0 right-0 rotate-180">
          <svg viewBox="0 0 1440 60" className="w-full h-12">
            <path fill="#ffffff" d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,40 1440,30 L1440,60 L0,60 Z" />
          </svg>
        </div>

        <div className="container-custom relative z-10 pt-8">
          <AnimatedSection className="text-center mb-16">
            <span className="badge bg-white/15 backdrop-blur-sm text-white border border-white/20 mb-4">
              <Ship className="w-4 h-4" />
              Proceso Sencillo
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
              ¿Cómo Obtener tu Licencia?
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Tres pasos simples para navegar legalmente en Puerto Rico
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '1',
                title: 'Inscríbete',
                desc: 'Completa el formulario de matrícula y realiza el pago de $80 de forma segura.',
                icon: FileText,
              },
              {
                step: '2',
                title: 'Estudia y Practica',
                desc: 'Estudia el material del curso y practica con nuestro examen de prueba gratuito.',
                icon: BookOpen,
              },
              {
                step: '3',
                title: 'Aprueba y Certifícate',
                desc: 'Toma el examen oficial con 80% para aprobar y recibe tu certificado digital.',
                icon: Award,
              },
            ].map((item, idx) => (
              <AnimatedSection key={idx} delay={idx * 0.15}>
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 bg-white/15 backdrop-blur-sm rounded-2xl
                                    flex items-center justify-center border border-white/20">
                      <item.icon className="w-10 h-10 text-maritime-gold" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-maritime-gold
                                    rounded-full flex items-center justify-center">
                      <span className="font-bold text-navy text-sm">{item.step}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                  <p className="text-white/75 leading-relaxed">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>

        {/* Ola inferior */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full h-12">
            <path fill="#ffffff" d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,40 1440,30 L1440,60 L0,60 Z" />
          </svg>
        </div>
      </section>

      {/* ============================================
          CTA FINAL
          ============================================ */}
      <section className="section bg-white">
        <div className="container-custom">
          <AnimatedSection>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy via-navy-light to-ocean-700 p-12 sm:p-16 text-center">
              {/* Decoración de fondo */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-maritime-gold/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-ocean/20 rounded-full translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl mb-6 border border-white/20">
                  <Star className="w-8 h-8 text-maritime-gold" />
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
                  ¿Listo para Zarpar?
                </h2>
                <p className="text-xl mb-10 max-w-2xl mx-auto text-white/85 leading-relaxed">
                  Únete a más de 500 navegantes certificados en Puerto Rico.
                  Tu aventura en las aguas del Caribe comienza hoy.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/matricula" className="btn-gold">
                    Inscribirme Ahora
                    <ChevronRight className="inline w-5 h-5 ml-1" />
                  </Link>
                  <Link
                    href="/practica"
                    className="bg-white/15 backdrop-blur-sm text-white px-8 py-4 rounded-xl
                               font-bold text-lg hover:bg-white/25 transition-all duration-300
                               border border-white/30"
                  >
                    Ver Examen de Práctica
                  </Link>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
