/**
 * PÁGINA DE TÉRMINOS Y CONDICIONES
 *
 * Contiene los términos y condiciones genéricos del sitio.
 * Este contenido debe actualizarse en el futuro con información
 * específica del BPS según sea necesario.
 */

import { FileText } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Términos y Condiciones | Americas Boating Club - Boqueron Power Squadron',
  description: 'Términos y condiciones del sistema de certificación de navegación Ley 430 PR.',
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-ice pt-28 pb-12">
      <div className="container-custom max-w-4xl">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-navy/10 rounded-full mb-4">
            <FileText className="w-8 h-8 text-navy" />
          </div>
          <h1 className="text-4xl font-bold text-navy mb-4">
            Términos y Condiciones
          </h1>
        </div>

        {/* Contenido */}
        <div className="card prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-navy mb-4">1. Aceptación de los Términos</h2>
            <p className="text-gray-700 leading-relaxed">
              Al acceder y utilizar el sitio web de Americas Boating Club - Boqueron Power
              Squadron, aceptas estos términos y condiciones en su totalidad. Si no estás
              de acuerdo con alguna parte de estos términos, no debes utilizar este sitio web.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-navy mb-4">2. Descripción del Servicio</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Este sitio web proporciona:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Inscripción digital al curso de certificación de navegación bajo la Ley 430 de Puerto Rico</li>
              <li>Exámenes de práctica para preparación</li>
              <li>Examen oficial de certificación en línea</li>
              <li>Emisión de certificados digitales de aprobación</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-navy mb-4">3. Inscripción y Pago</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>El costo del curso de certificación es de $80.00 USD.</li>
              <li>El envío opcional del libro de texto por correo tiene un costo adicional. El monto vigente se indica en el formulario de inscripción al momento de completar la matrícula.</li>
              <li>Los pagos se procesan de forma segura a través de un procesador de pagos certificado que cumple con los estándares de seguridad de la industria.</li>
              <li>Una vez procesado el pago, no se realizan reembolsos excepto en circunstancias
                especiales evaluadas caso por caso.</li>
              <li>La inscripción se confirma una vez que el pago ha sido verificado exitosamente.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-navy mb-4">4. Exámenes de Certificación</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>El examen de práctica está disponible de forma gratuita y puede tomarse
                las veces que desees.</li>
              <li>El examen oficial requiere inscripción y pago previos.</li>
              <li>Se necesita obtener un 80% o más de respuestas correctas para aprobar.</li>
              <li>Si no apruebas, puedes retomar el examen siguiendo las instrucciones proporcionadas.</li>
              <li>Los resultados de los exámenes se registran en nuestro sistema.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-navy mb-4">5. Certificado de Navegación</h2>
            <p className="text-gray-700 leading-relaxed">
              Al aprobar el examen oficial, recibirás un certificado digital. Este certificado
              es un documento de preparación emitido por Americas Boating Club - Boqueron Power
              Squadron. Para obtener la licencia oficial de navegación, deberás completar el
              proceso correspondiente ante el Departamento de Recursos Naturales y Ambientales
              (DRNA) de Puerto Rico.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-navy mb-4">6. Conducta del Usuario</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Al usar este sitio, te comprometes a:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Proporcionar información veraz y precisa durante la inscripción</li>
              <li>No compartir tus credenciales de acceso con terceros</li>
              <li>No intentar hacer trampa o manipular los resultados de los exámenes</li>
              <li>No intentar acceder a áreas restringidas del sitio sin autorización</li>
              <li>Usar el sitio de manera responsable y conforme a la ley</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-navy mb-4">7. Propiedad Intelectual</h2>
            <p className="text-gray-700 leading-relaxed">
              Todo el contenido de este sitio web, incluyendo textos, preguntas de examen,
              logotipos, gráficos y diseño, es propiedad de Americas Boating Club - Boqueron
              Power Squadron y está protegido por las leyes de propiedad intelectual aplicables.
              No se permite la reproducción, distribución o uso no autorizado de este contenido.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-navy mb-4">8. Limitación de Responsabilidad</h2>
            <p className="text-gray-700 leading-relaxed">
              Americas Boating Club - Boqueron Power Squadron se esfuerza por mantener
              la información del sitio web actualizada y precisa. Sin embargo, no garantizamos
              que el contenido esté libre de errores. No nos hacemos responsables de daños
              directos o indirectos que puedan resultar del uso de este sitio web o de la
              información proporcionada en el mismo.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-navy mb-4">9. Modificaciones</h2>
            <p className="text-gray-700 leading-relaxed">
              Nos reservamos el derecho de modificar estos términos y condiciones en cualquier
              momento. Los cambios entrarán en vigor inmediatamente después de su publicación
              en este sitio web. El uso continuado del sitio después de cualquier cambio
              constituye tu aceptación de los nuevos términos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy mb-4">10. Ley Aplicable</h2>
            <p className="text-gray-700 leading-relaxed">
              Estos términos y condiciones se rigen por las leyes del Estado Libre Asociado
              de Puerto Rico. Cualquier disputa relacionada con estos términos será sometida
              a la jurisdicción de los tribunales competentes de Puerto Rico.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
