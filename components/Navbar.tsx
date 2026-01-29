/**
 * COMPONENTE DE NAVEGACIÓN (NAVBAR)
 * 
 * Este componente muestra la barra de navegación superior en todas las páginas.
 * Incluye:
 * - Logo de BPS
 * - Links de navegación
 * - Menú hamburguesa para móviles
 */

'use client'; // Necesario porque usa interactividad (useState, onClick)

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X, Anchor } from 'lucide-react';

export default function Navbar() {
  /**
   * Estado para controlar si el menú móvil está abierto o cerrado
   * - true: menú abierto
   * - false: menú cerrado
   */
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /**
   * Función para alternar el estado del menú móvil
   * Si está abierto, lo cierra. Si está cerrado, lo abre.
   */
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  /**
   * Array con los links de navegación
   * Cada objeto contiene el texto a mostrar y la ruta (href)
   */
  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/matricula', label: 'Matrícula' },
    { href: '/examen', label: 'Examen' },
  ];

  return (
    <nav className="bg-navy text-white shadow-lg sticky top-0 z-50">
      {/* 
        sticky top-0: La navbar se queda fija arriba al hacer scroll
        z-50: Nivel alto de z-index para que quede sobre otros elementos
      */}
      
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* 
            ==================
            LOGO Y NOMBRE
            ==================
          */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            {/* Icono de ancla como logo alternativo */}
            <div className="w-10 h-10 bg-maritime-gold rounded-full flex items-center justify-center">
              <Anchor className="w-6 h-6 text-navy" />
            </div>
            
            {/* Nombre del club */}
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight">Americas Boating Club</span>
              <span className="text-sm text-ice leading-tight">Boqueron Power Squadron</span>
            </div>
          </Link>

          {/* 
            ==================
            LINKS DE NAVEGACIÓN (Pantallas grandes)
            ==================
          */}
          <div className="hidden md:flex items-center gap-8">
            {/* 
              hidden md:flex: 
              - Oculto en móviles (hidden)
              - Visible como flex en pantallas medianas y mayores (md:flex)
            */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white font-semibold hover:text-maritime-gold transition-colors duration-200 relative group"
              >
                {link.label}
                {/* Línea animada que aparece al hacer hover */}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-maritime-gold group-hover:w-full transition-all duration-200" />
              </Link>
            ))}
          </div>

          {/* 
            ==================
            BOTÓN DE MENÚ HAMBURGUESA (Pantallas pequeñas)
            ==================
          */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 hover:bg-navy-light rounded-lg transition-colors"
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {/* 
              Muestra el icono X si el menú está abierto,
              o el icono de menú (hamburguesa) si está cerrado
            */}
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* 
          ==================
          MENÚ MÓVIL (Solo visible en pantallas pequeñas)
          ==================
        */}
        {isMenuOpen && (
          <div className="md:hidden pb-6 animate-slide-up">
            {/* 
              md:hidden: Solo visible en pantallas pequeñas
              animate-slide-up: Animación de entrada desde abajo
            */}
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)} // Cierra el menú al hacer clic en un link
                  className="text-white font-semibold hover:text-maritime-gold hover:bg-navy-light px-4 py-3 rounded-lg transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
