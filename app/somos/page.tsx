/**
 * PÁGINA "SOMOS" (SOBRE NOSOTROS)
 *
 * Cuenta la historia del BPS, su misión y valores.
 * Incluye imagen del océano como fondo del hero.
 */

import Image from 'next/image';
import Link from 'next/link';
import {
  Anchor, Award, Shield, Users, Heart,
  Target, Eye, Star, ChevronRight,
} from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';
import Counter from '@/components/Counter';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Somos | Americas Boating Club - Boquerón Power Squadron',
  description: 'Conoce la historia, misión y valores de Americas Boating Club - Boquerón Power Squadron. Más de 50 años promoviendo la navegación segura en Puerto Rico.',
};

export default function SomosPage() {
  return (
    <div className="min-h-screen">
      {/* Hero con imagen de fondo */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/about-ocean.jpg"
            alt="Océano del Caribe"
            fill
            className="object-cover"
            priority
            quality={85}
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>

        <div className="relative z-10 container-custom text-center text-white pt-20">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm
                            px-5 py-2.5 rounded-full mb-6 border border-white/20">
              <Anchor className="w-4 h-4 text-maritime-gold" />
              <span className="text-sm font-semibold text-white/90">Nuestra Historia</span>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4">
              ¿Quiénes Somos?
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <p className="text-xl text-white/85 max-w-2xl mx-auto">
              Más de 50 años promoviendo la navegación segura en las hermosas aguas de Puerto Rico
            </p>
          </AnimatedSection>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full h-12">
            <path fill="#ffffff" d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,40 1440,30 L1440,60 L0,60 Z" />
          </svg>
        </div>
      </section>

      {/* Historia */}
      <section className="section bg-white">
        <div className="container-custom max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
              <span className="badge-ocean mb-4">
                <Heart className="w-4 h-4" />
                Nuestra Historia
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Americas Boating Club -<br />
                <span className="text-gradient-ocean">Boquerón Power Squadron</span>
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Somos parte de Americas Boating Club (anteriormente conocido como
                  United States Power Squadrons), la organización de educación náutica
                  más grande de los Estados Unidos, con más de 50,000 miembros a nivel nacional.
                </p>
                <p>
                  Nuestra escuadrilla en Boquerón, Puerto Rico, se dedica a educar
                  y certificar navegantes bajo la Ley 430 del Departamento de Recursos
                  Naturales y Ambientales (DRNA), asegurando que cada persona que
                  salga al mar lo haga con el conocimiento y la seguridad necesarios.
                </p>
                <p>
                  Ofrecemos cursos de certificación para todo tipo de embarcaciones:
                  botes de motor, veleros, jet skis (motos acuáticas) y más. Nuestro
                  compromiso es que cada navegante en Puerto Rico esté preparado
                  para disfrutar del mar de manera responsable.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2} direction="right">
              <div className="relative">
                <div className="w-full aspect-square rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src="/images/bps-logo.png"
                    alt="Logo de BPS"
                    fill
                    className="object-contain p-12 bg-navy/5"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-maritime-gold rounded-2xl p-4 shadow-xl">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-navy block">50+</span>
                    <span className="text-sm font-semibold text-navy/70">Años</span>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Misión, Visión, Valores */}
      <section className="section bg-ice">
        <div className="container-custom">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Nuestro Propósito</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Lo que nos impulsa cada día a formar navegantes responsables
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedSection delay={0}>
              <div className="card-hover text-center h-full">
                <div className="w-16 h-16 bg-ocean-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Target className="w-8 h-8 text-ocean" />
                </div>
                <h3 className="text-xl font-bold text-navy mb-3">Nuestra Misión</h3>
                <p className="text-gray-600 leading-relaxed">
                  Promover la navegación segura y responsable en Puerto Rico a través
                  de la educación, certificación y el compañerismo entre navegantes.
                  Buscamos que cada persona que salga al mar tenga el conocimiento
                  necesario para proteger su vida y la de los demás.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.15}>
              <div className="card-hover text-center h-full">
                <div className="w-16 h-16 bg-sand-light rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Eye className="w-8 h-8 text-maritime-gold" />
                </div>
                <h3 className="text-xl font-bold text-navy mb-3">Nuestra Visión</h3>
                <p className="text-gray-600 leading-relaxed">
                  Ser la organización líder en educación náutica en Puerto Rico,
                  reconocida por la excelencia en la formación de navegantes certificados
                  y por nuestro compromiso con la conservación de los recursos marinos
                  del Caribe.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <div className="card-hover text-center h-full">
                <div className="w-16 h-16 bg-ocean-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Heart className="w-8 h-8 text-ocean" />
                </div>
                <h3 className="text-xl font-bold text-navy mb-3">Nuestros Valores</h3>
                <p className="text-gray-600 leading-relaxed">
                  Seguridad ante todo, educación de calidad, respeto por el medio
                  ambiente marino, servicio a la comunidad y compañerismo.
                  Creemos que el mar es para todos, siempre y cuando se navegue
                  con responsabilidad.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="py-16 bg-tropical text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 rotate-180">
          <svg viewBox="0 0 1440 60" className="w-full h-12">
            <path fill="#F8F9FA" d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,40 1440,30 L1440,60 L0,60 Z" />
          </svg>
        </div>

        <div className="container-custom relative z-10 pt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 500, suffix: '+', label: 'Navegantes Certificados' },
              { value: 50, suffix: '+', label: 'Años de Experiencia' },
              { value: 95, suffix: '%', label: 'Tasa de Aprobación' },
              { value: 85, suffix: '', label: 'Preguntas del Examen' },
            ].map((stat, idx) => (
              <AnimatedSection key={idx} delay={idx * 0.1}>
                <div className="text-4xl sm:text-5xl font-bold text-maritime-gold mb-2">
                  <Counter end={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-white/75 font-medium">{stat.label}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full h-12">
            <path fill="#ffffff" d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,40 1440,30 L1440,60 L0,60 Z" />
          </svg>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-white">
        <div className="container-custom text-center">
          <AnimatedSection>
            <h2 className="text-4xl font-bold mb-6">¿Listo para Comenzar?</h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Únete a nuestra familia de navegantes certificados.
              El proceso es sencillo y te preparamos para navegar con confianza.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/matricula" className="btn-gold">
                Inscríbete Ahora
                <ChevronRight className="inline w-5 h-5 ml-1" />
              </Link>
              <Link href="/practica" className="btn-secondary">
                Examen de Práctica
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
