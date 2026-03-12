/**
 * COMPONENTE DE FOOTER (PIE DE PÁGINA)
 *
 * Pie de página moderno con estilo tropical.
 * Incluye: sobre nosotros, links, contacto, y copyright.
 */

import Link from 'next/link';
import Image from 'next/image';
import { Anchor, Mail, Waves } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative">
      {/* Ola decorativa superior */}
      <div className="bg-white">
        <svg viewBox="0 0 1440 60" className="w-full h-12">
          <path fill="#002855" d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,40 1440,30 L1440,60 L0,60 Z" />
        </svg>
      </div>

      <div className="bg-navy text-white">
        <div className="container-custom py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Columna 1: Sobre Nosotros */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-20 h-20 relative flex-shrink-0">
                  <Image
                    src="/images/bps-logo.png"
                    alt="BPS Logo"
                    fill
                    className="object-contain rounded-full"
                    sizes="80px"
                  />
                </div>
                <div>
                  <span className="font-bold text-xl block leading-tight">Americas Boating Club</span>
                  <span className="text-base text-ocean-200 leading-tight">Boquerón Power Squadron</span>
                </div>
              </div>
              <p className="text-white/70 leading-relaxed mb-5">
                Dedicados a promover la navegación segura y responsable en las aguas
                de Puerto Rico desde hace más de 50 años.
              </p>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                <Anchor className="w-4 h-4 text-maritime-gold" />
                <span className="text-sm font-semibold text-white/90">Certificación Ley 430</span>
              </div>
            </div>

            {/* Columna 2: Enlaces Rápidos */}
            <div>
              <h3 className="font-bold text-lg mb-5 text-white">Navegación</h3>
              <ul className="space-y-3">
                {[
                  { href: '/', label: 'Inicio' },
                  { href: '/somos', label: 'Somos' },
                  { href: '/matricula', label: 'Matrícula Digital' },
                  { href: '/practica', label: 'Examen de Práctica' },
                  { href: '/examen', label: 'Examen Oficial' },
                  { href: '/admin', label: 'Panel Administrativo' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/60 hover:text-ocean-300 transition-colors duration-200 flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 bg-ocean-400 rounded-full" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Columna 3: Legal */}
            <div>
              <h3 className="font-bold text-lg mb-5 text-white">Legal</h3>
              <ul className="space-y-3">
                {[
                  { href: '/privacidad', label: 'Política de Privacidad' },
                  { href: '/terminos', label: 'Términos y Condiciones' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/60 hover:text-ocean-300 transition-colors duration-200 flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 bg-ocean-400 rounded-full" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Columna 4: Contacto (solo email) */}
            <div>
              <h3 className="font-bold text-lg mb-5 text-white">Contacto</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-ocean-300 flex-shrink-0 mt-0.5" />
                  <a
                    href="mailto:info@boqueron-squadron.org"
                    className="text-white/60 hover:text-ocean-300 transition-colors"
                  >
                    info@boqueron-squadron.org
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Copyright */}
        <div className="border-t border-white/10">
          <div className="container-custom py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-white/50 text-sm">
              <p>
                &copy; {currentYear} Americas Boating Club - Boquerón Power Squadron.
                Todos los derechos reservados.
              </p>
              <div className="flex items-center gap-2">
                <Waves className="w-4 h-4 text-ocean-400" />
                <span>Navega Seguro, Navega Legal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
