/**
 * COMPONENTE DE FOOTER (PIE DE PÁGINA)
 * 
 * Este componente muestra el pie de página en todas las páginas.
 * Incluye:
 * - Información de contacto
 * - Links rápidos
 * - Copyright
 */

import Link from 'next/link';
import { Anchor, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  // Año actual para el copyright
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy text-white">
      {/* 
        ==================
        SECCIÓN PRINCIPAL DEL FOOTER
        ==================
      */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 
            ==================
            COLUMNA 1: SOBRE NOSOTROS
            ==================
          */}
          <div>
            {/* Logo y nombre */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-maritime-gold rounded-full flex items-center justify-center">
                <Anchor className="w-6 h-6 text-navy" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight">Americas Boating Club</span>
                <span className="text-sm text-ice leading-tight">Boqueron Power Squadron</span>
              </div>
            </div>
            
            {/* Descripción */}
            <p className="text-ice leading-relaxed mb-4">
              Dedicados a promover la navegación segura y responsable en las aguas 
              de Puerto Rico desde hace más de 50 años.
            </p>
            
            {/* Insignia de certificación */}
            <div className="inline-flex items-center gap-2 bg-navy-light px-4 py-2 rounded-lg">
              <Anchor className="w-5 h-5 text-maritime-gold" />
              <span className="text-sm font-semibold">Certificación Ley 430 Aprobada</span>
            </div>
          </div>

          {/* 
            ==================
            COLUMNA 2: LINKS RÁPIDOS
            ==================
          */}
          <div>
            <h3 className="font-bold text-xl mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-3">
              {/* 
                space-y-3: Espaciado vertical entre elementos de la lista
              */}
              <li>
                <Link 
                  href="/" 
                  className="text-ice hover:text-maritime-gold transition-colors duration-200 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 bg-maritime-gold rounded-full" />
                  Inicio
                </Link>
              </li>
              <li>
                <Link 
                  href="/matricula" 
                  className="text-ice hover:text-maritime-gold transition-colors duration-200 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 bg-maritime-gold rounded-full" />
                  Matrícula Digital
                </Link>
              </li>
              <li>
                <Link 
                  href="/examen" 
                  className="text-ice hover:text-maritime-gold transition-colors duration-200 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 bg-maritime-gold rounded-full" />
                  Examen en Línea
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin" 
                  className="text-ice hover:text-maritime-gold transition-colors duration-200 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 bg-maritime-gold rounded-full" />
                  Panel Administrativo
                </Link>
              </li>
            </ul>
          </div>

          {/* 
            ==================
            COLUMNA 3: CONTACTO
            ==================
          */}
          <div>
            <h3 className="font-bold text-xl mb-4">Contacto</h3>
            <div className="space-y-4">
              {/* Ubicación */}
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-maritime-gold flex-shrink-0 mt-1" />
                <div>
                  <p className="text-ice">
                    Boqueron, Puerto Rico
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-maritime-gold flex-shrink-0 mt-1" />
                <div>
                  <a 
                    href="mailto:info@boqueron-squadron.org" 
                    className="text-ice hover:text-maritime-gold transition-colors duration-200"
                  >
                    info@boqueron-squadron.org
                  </a>
                </div>
              </div>

              {/* Teléfono */}
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-maritime-gold flex-shrink-0 mt-1" />
                <div>
                  <a 
                    href="tel:+17871234567" 
                    className="text-ice hover:text-maritime-gold transition-colors duration-200"
                  >
                    (787) 123-4567
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 
        ==================
        BARRA DE COPYRIGHT
        ==================
      */}
      <div className="border-t border-navy-light">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-ice text-sm">
            {/* Copyright */}
            <p>
              &copy; {currentYear} Americas Boating Club - Boqueron Power Squadron. 
              Todos los derechos reservados.
            </p>
            
            {/* Links legales */}
            <div className="flex gap-6">
              <Link 
                href="#" 
                className="hover:text-maritime-gold transition-colors duration-200"
              >
                Privacidad
              </Link>
              <Link 
                href="#" 
                className="hover:text-maritime-gold transition-colors duration-200"
              >
                Términos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
