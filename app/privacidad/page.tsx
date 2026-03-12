/**
 * PÁGINA DE POLÍTICA DE PRIVACIDAD
 *
 * Contiene las políticas genéricas de privacidad del sitio.
 * Este contenido debe actualizarse en el futuro con información
 * específica del BPS según sea necesario.
 */

import { Shield } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidad | Americas Boating Club - Boqueron Power Squadron',
  description: 'Política de privacidad del sistema de certificación de navegación Ley 430 PR.',
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-ice pt-28 pb-12">
      <div className="container-custom max-w-4xl">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-navy/10 rounded-full mb-4">
            <Shield className="w-8 h-8 text-navy" />
          </div>
          <h1 className="text-4xl font-bold text-navy mb-4">
            Política de Privacidad
          </h1>
          <p className="text-gray-600">
            Última actualización: Enero 2026
          </p>
        </div>

        {/* Contenido */}
        <div className="card prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-navy mb-4">1. Información que Recopilamos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Americas Boating Club - Boqueron Power Squadron recopila la siguiente información
              cuando te inscribes en nuestro curso de certificación de navegación:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Nombre completo, dirección, teléfono y correo electrónico</li>
              <li>Fecha de nacimiento y género</li>
              <li>Características físicas (requeridas para el certificado de navegación)</li>
              <li>Información de la embarcación (si aplica)</li>
              <li>Resultados de los exámenes de certificación</li>
              <li>Información de pago procesada a través de nuestro procesador de pagos autorizado</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-navy mb-4">2. Cómo Usamos tu Información</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Utilizamos la información recopilada para:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Procesar tu inscripción y matrícula en el curso</li>
              <li>Administrar los exámenes de certificación</li>
              <li>Emitir certificados digitales de navegación</li>
              <li>Comunicarnos contigo sobre el estado de tu certificación</li>
              <li>Cumplir con los requisitos de la Ley 430 de Puerto Rico</li>
              <li>Mejorar nuestros servicios educativos</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-navy mb-4">3. Procesamiento de Pagos</h2>
            <p className="text-gray-700 leading-relaxed">
              Los pagos se procesan de forma segura a través de un procesador de pagos
              certificado y autorizado. No almacenamos números de tarjetas de crédito ni
              datos financieros sensibles en nuestros servidores. Nuestro procesador de
              pagos cumple con los estándares PCI DSS de seguridad en la industria de pagos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-navy mb-4">4. Almacenamiento de Datos</h2>
            <p className="text-gray-700 leading-relaxed">
              Tu información se almacena de forma segura en servidores protegidos con
              acceso restringido. Implementamos medidas de seguridad técnicas y
              organizativas apropiadas para proteger tus datos personales contra acceso
              no autorizado, pérdida, alteración o divulgación indebida.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-navy mb-4">5. Compartir Información</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              No vendemos ni compartimos tu información personal con terceros, excepto:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Con el Departamento de Recursos Naturales y Ambientales (DRNA), según lo
                requiera la Ley 430 para el proceso de certificación</li>
              <li>Con proveedores de servicios de confianza necesarios para operar el sitio,
                tales como procesamiento de pagos y almacenamiento seguro de datos</li>
              <li>Cuando sea requerido por ley o proceso legal</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-navy mb-4">6. Tus Derechos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Tienes derecho a:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Solicitar acceso a la información personal que tenemos sobre ti</li>
              <li>Solicitar corrección de datos incorrectos</li>
              <li>Solicitar la eliminación de tus datos personales</li>
              <li>Retirar tu consentimiento en cualquier momento</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-navy mb-4">7. Cookies y Tecnologías Similares</h2>
            <p className="text-gray-700 leading-relaxed">
              Este sitio web puede utilizar cookies y tecnologías similares para mejorar
              la experiencia del usuario. Estas cookies no recopilan información personal
              identificable y se utilizan únicamente para el funcionamiento correcto del sitio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-navy mb-4">8. Contacto</h2>
            <p className="text-gray-700 leading-relaxed">
              Si tienes preguntas sobre esta política de privacidad o deseas ejercer
              tus derechos, puedes contactarnos a través de los canales disponibles
              en nuestro sitio web.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy mb-4">9. Cambios a esta Política</h2>
            <p className="text-gray-700 leading-relaxed">
              Nos reservamos el derecho de actualizar esta política de privacidad en
              cualquier momento. Los cambios se publicarán en esta página con la fecha
              de la última actualización.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
