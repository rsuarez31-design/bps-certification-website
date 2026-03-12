/**
 * COMPONENTE DE NAVEGACIÓN (NAVBAR)
 *
 * Barra de navegación moderna con efecto de transparencia.
 * En la parte superior es transparente y al hacer scroll se vuelve sólida.
 * Incluye menú hamburguesa para celulares.
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Detectar si el usuario hizo scroll (para cambiar el fondo del navbar)
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/somos', label: 'Somos' },
    { href: '/matricula', label: 'Matrícula' },
    { href: '/practica', label: 'Práctica' },
    { href: '/examen', label: 'Examen Oficial' },
    { href: '/admin', label: 'Admin' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-navy shadow-lg'
          : 'bg-navy/90 backdrop-blur-md'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo y nombre */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="w-16 h-16 relative flex-shrink-0">
              <Image
                src="/images/bps-logo.png"
                alt="BPS Logo"
                fill
                className="object-contain rounded-full"
                sizes="64px"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight text-white">
                Americas Boating Club
              </span>
              <span className="text-sm leading-tight text-ocean-200">
                Boquerón Power Squadron
              </span>
            </div>
          </Link>

          {/* Links de navegación (pantallas grandes) */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/90 font-medium hover:text-maritime-gold transition-colors duration-200 text-sm uppercase tracking-wide"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/matricula"
              className="ml-2 bg-maritime-gold text-navy px-5 py-2.5 rounded-xl font-bold text-sm
                         hover:bg-yellow-400 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Inscríbete
            </Link>
          </div>

          {/* Botón hamburguesa (móviles) */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Menú móvil con animación */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="pb-6 pt-2 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-white font-medium hover:text-maritime-gold hover:bg-white/10
                               px-4 py-3 rounded-xl transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/matricula"
                  onClick={() => setIsMenuOpen(false)}
                  className="mt-2 bg-maritime-gold text-navy px-4 py-3 rounded-xl font-bold
                             text-center hover:bg-yellow-400 transition-all duration-300"
                >
                  Inscríbete Ahora
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
