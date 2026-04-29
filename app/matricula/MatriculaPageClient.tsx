/**
 * PÁGINA DE MATRÍCULA DIGITAL
 *
 * Formulario de inscripción para el curso de navegación.
 * Tras un pago exitoso la inscripción queda en Supabase (solo pagadas en el panel).
 * Si se cancela el pago o falla Checkout, el borrador pending se elimina.
 *
 * Secciones del formulario:
 * 1. Información del Curso (título dinámico + fecha automática)
 * 2. Información Personal (con apellido, direcciones duales, upload de ID)
 * 3. Características Físicas
 * 4. Información de la Embarcación
 * 5. Pago con Stripe ($80 + $13 opcional por envío de libro)
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { User, Ruler, Ship, CheckCircle2, AlertCircle, CreditCard, BookOpen, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';

/**
 * Estructura de todos los campos del formulario.
 */
interface FormData {
  // Información del curso
  courseName: string;
  courseDate: string;

  // Datos personales
  fullName: string;
  lastName: string;
  postalAddress: string;
  physicalAddress: string;
  city: string;
  country: string;
  zipCode: string;
  phone: string;
  cellphone: string;
  email: string;
  gender: string;
  birthDate: string;
  isMinor: string;

  // Campos de firma (solo si es menor de edad)
  parentGuardianSignature: string;
  parentGuardianSignedAt: string;

  // Características físicas
  hairColor: string;
  eyeColor: string;
  heightFeet: string;
  heightInches: string;

  // Información de la embarcación
  boatType: string;
  boatLength: string;
  hasTrailer: string;
  yearsExperience: string;
  motorPower: string;
}

// Formatos de archivo permitidos para el upload de identificación
const FORMATOS_PERMITIDOS = ['image/jpeg', 'image/png', 'application/pdf'];
const TAMANO_MAXIMO_MB = 5;
const TAMANO_MAXIMO_BYTES = TAMANO_MAXIMO_MB * 1024 * 1024;

/**
 * Componente principal con Suspense (requerido por useSearchParams en Next.js 14)
 */
export default function MatriculaPageClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-ice flex items-center justify-center">
        <p className="text-xl text-gray-600">Cargando formulario...</p>
      </div>
    }>
      <MatriculaContent />
    </Suspense>
  );
}

function MatriculaContent() {
  const searchParams = useSearchParams();
  const paymentSuccess = searchParams.get('success') === 'true';
  const paymentCanceled = searchParams.get('canceled') === 'true';
  const registrationIdAlCancelar = searchParams.get('registration_id');

  // Fecha de hoy en formato YYYY-MM-DD (para campos automáticos)
  const hoy = new Date().toISOString().split('T')[0];

  // Estado del formulario con valores iniciales
  const [formData, setFormData] = useState<FormData>({
    courseName: '',
    courseDate: hoy,
    fullName: '',
    lastName: '',
    postalAddress: '',
    physicalAddress: '',
    city: '',
    country: 'Puerto Rico',
    zipCode: '',
    phone: '',
    cellphone: '',
    email: '',
    gender: '',
    birthDate: '',
    isMinor: '',
    parentGuardianSignature: '',
    parentGuardianSignedAt: hoy,
    hairColor: '',
    eyeColor: '',
    heightFeet: '',
    heightInches: '',
    boatType: '',
    boatLength: '',
    hasTrailer: '',
    yearsExperience: '',
    motorPower: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [wantsBookShipping, setWantsBookShipping] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Checkbox: "Usar la misma dirección para ambas"
  const [sameAddress, setSameAddress] = useState(false);

  // Archivo de identificación seleccionado por el usuario
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idFileError, setIdFileError] = useState('');

  // Cargar el título del curso desde la configuración del admin
  useEffect(() => {
    const cargarConfiguracion = async () => {
      try {
        const { data } = await supabase
          .from('site_config')
          .select('course_month, course_year')
          .eq('id', 'default')
          .single();

        if (data) {
          const titulo = `Curso Básico De Navegación - ${data.course_month} - ${data.course_year}`;
          setFormData(prev => ({ ...prev, courseName: titulo }));
        }
      } catch (err) {
        console.warn('No se pudo cargar la configuración del curso:', err);
      }
    };
    cargarConfiguracion();
  }, []);

  // Si el pago fue exitoso (viene de Stripe), mostrar confirmación
  useEffect(() => {
    if (paymentSuccess) setIsSubmitted(true);
  }, [paymentSuccess]);

  // Cuando se activa "misma dirección", copiar postal a física
  useEffect(() => {
    if (sameAddress) {
      setFormData(prev => ({ ...prev, physicalAddress: prev.postalAddress }));
    }
  }, [sameAddress, formData.postalAddress]);

  /**
   * Si el usuario cancela en Stripe, la URL trae registration_id.
   * Borramos el borrador "pending" en la base para no acumular inscripciones sin pago.
   */
  useEffect(() => {
    if (!paymentCanceled || !registrationIdAlCancelar) return;
    if (typeof window === 'undefined') return;
    const marca = `bps_abandon_${registrationIdAlCancelar}`;
    if (sessionStorage.getItem(marca)) return;
    sessionStorage.setItem(marca, '1');
    fetch('/api/registrations/abandon-pending', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registrationId: registrationIdAlCancelar }),
    }).catch(() => {});
  }, [paymentCanceled, registrationIdAlCancelar]);

  // Manejar cambios en los campos de texto
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejar selección de archivo de identificación
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIdFileError('');
    const archivo = e.target.files?.[0];
    if (!archivo) { setIdFile(null); return; }

    if (!FORMATOS_PERMITIDOS.includes(archivo.type)) {
      setIdFileError('Formato no válido. Solo se aceptan: JPG, PNG o PDF.');
      setIdFile(null);
      return;
    }
    if (archivo.size > TAMANO_MAXIMO_BYTES) {
      setIdFileError(`El archivo es muy grande. Máximo ${TAMANO_MAXIMO_MB} MB.`);
      setIdFile(null);
      return;
    }
    setIdFile(archivo);
  };

  // Validar todos los campos obligatorios
  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.fullName.trim()) newErrors.push('Nombre es obligatorio');
    if (!formData.lastName.trim()) newErrors.push('Apellido es obligatorio');
    if (!formData.email.trim()) newErrors.push('Correo electrónico es obligatorio');
    if (!formData.phone.trim()) newErrors.push('Teléfono es obligatorio');
    if (!formData.birthDate) newErrors.push('Fecha de nacimiento es obligatoria');
    if (!formData.gender) newErrors.push('Sexo es obligatorio');

    if (formData.isMinor === 'Si') {
      if (!formData.parentGuardianSignature.trim()) {
        newErrors.push('Firma de padres o guardián es obligatoria para menores de edad');
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.push('El correo electrónico no tiene un formato válido (ej: nombre@correo.com)');
    }

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (formData.phone && phoneDigits.length < 7) {
      newErrors.push('El teléfono debe tener al menos 7 dígitos');
    }

    if (formData.birthDate) {
      const birthYear = new Date(formData.birthDate).getFullYear();
      const currentYear = new Date().getFullYear();
      if (birthYear < 1920 || birthYear > currentYear) {
        newErrors.push('La fecha de nacimiento no parece correcta');
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Enviar el formulario: guardar en Supabase, subir archivo, redirigir a Stripe
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsProcessingPayment(true);
    /** Si falla Stripe después de insertar, borramos el borrador pending */
    let idMatriculaCreada: string | null = null;
    try {
      const totalCents = wantsBookShipping ? 9300 : 8000;

      // PASO 1: Guardar matrícula con estado "pending" (se borra si no hay pago o si falla Checkout)
      const { data: registration, error: dbError } = await supabase
        .from('registrations')
        .insert({
          course_name: formData.courseName,
          course_date: formData.courseDate,
          full_name: formData.fullName,
          last_name: formData.lastName,
          postal_address: formData.postalAddress,
          physical_address: sameAddress ? formData.postalAddress : formData.physicalAddress,
          city: formData.city,
          country: formData.country,
          zip_code: formData.zipCode,
          phone: formData.phone,
          cellphone: formData.cellphone,
          email: formData.email,
          gender: formData.gender,
          birth_date: formData.birthDate,
          is_minor: formData.isMinor === 'Si',
          parent_guardian_signature: formData.parentGuardianSignature || null,
          parent_guardian_signed_at: formData.isMinor === 'Si' ? formData.parentGuardianSignedAt : null,
          hair_color: formData.hairColor,
          eye_color: formData.eyeColor,
          height_feet: formData.heightFeet,
          height_inches: formData.heightInches,
          boat_type: formData.boatType,
          boat_length: formData.boatLength,
          has_trailer: formData.hasTrailer,
          years_experience: formData.yearsExperience,
          motor_power: formData.motorPower,
          wants_book_shipping: wantsBookShipping,
          amount_total_cents: totalCents,
          payment_status: 'pending',
        })
        .select()
        .single();

      if (dbError || !registration) {
        throw new Error('No se pudo guardar la matrícula: ' + (dbError?.message || 'Error desconocido'));
      }
      idMatriculaCreada = registration.id;

      // PASO 2: Subir archivo de identificación (si se seleccionó uno)
      if (idFile) {
        const ext = idFile.name.split('.').pop()?.toLowerCase() || 'jpg';
        const nombreArchivo = `${registration.id}_${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('id-documents')
          .upload(nombreArchivo, idFile);

        if (!uploadError) {
          await supabase
            .from('registrations')
            .update({ id_document_path: nombreArchivo })
            .eq('id', registration.id);
        } else {
          console.warn('No se pudo subir el archivo de ID:', uploadError.message);
        }
      }

      // PASO 3: Crear sesión de pago en Stripe
      const stripeResponse = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: registration.id, wantsBookShipping }),
      });
      const stripeData = await stripeResponse.json();

      if (stripeData.error) {
        throw new Error(stripeData.error);
      }
      if (!stripeData.url) {
        throw new Error('No se pudo crear la sesión de pago. Verifica que el sistema de pagos esté configurado correctamente.');
      }

      // PASO 4: Redirigir a Stripe
      window.location.href = stripeData.url;
    } catch (error: any) {
      console.error('Error al procesar matrícula:', error);
      if (idMatriculaCreada) {
        fetch('/api/registrations/abandon-pending', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ registrationId: idMatriculaCreada }),
        }).catch(() => {});
      }
      setErrors([error.message || 'Ocurrió un error al procesar tu matrícula. Por favor intenta de nuevo.']);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // --- PANTALLA DE CONFIRMACIÓN ---
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-ice pt-28 pb-20">
        <div className="container-custom max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-maritime-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-maritime-green" />
            </div>
            <h1 className="text-3xl font-bold text-navy mb-4">¡Matrícula y Pago Completados!</h1>
            <p className="text-lg text-gray-600 mb-8">
              Tu inscripción ha sido procesada exitosamente. Te contactaremos pronto
              con los detalles del curso y la fecha del examen.
            </p>
            <a href="/" className="btn-primary inline-block">Volver al Inicio</a>
          </div>
        </div>
      </div>
    );
  }

  // --- PANTALLA DE PAGO CANCELADO ---
  if (paymentCanceled) {
    return (
      <div className="min-h-screen bg-ice pt-28 pb-20">
        <div className="container-custom max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-maritime-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-maritime-red" />
            </div>
            <h1 className="text-3xl font-bold text-navy mb-4">Pago Cancelado</h1>
            <p className="text-lg text-gray-600 mb-6">
              {registrationIdAlCancelar
                ? 'No se completó el pago. Tu borrador de inscripción se descartó y no quedó guardado en nuestro sistema.'
                : 'Tu pago fue cancelado. Puedes intentar de nuevo completando el formulario.'}
            </p>
            <a href="/matricula" className="btn-primary inline-block">Volver al formulario</a>
          </div>
        </div>
      </div>
    );
  }

  // --- FORMULARIO PRINCIPAL ---
  return (
    <div className="min-h-screen bg-ice pt-28 pb-12">
      <div className="container-custom max-w-4xl">
        {/* Título */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 bg-ocean-50 text-ocean-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <CreditCard className="w-4 h-4" />
            Inscripción al Curso
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-navy mb-4">Formulario de Matrícula</h1>
          <p className="text-xl text-gray-600">Completa este formulario para inscribirte en el curso de navegación</p>
        </div>

        {/* Errores */}
        {errors.length > 0 && (
          <div className="bg-maritime-red/10 border-2 border-maritime-red rounded-lg p-6 mb-8">
            <div className="flex gap-3">
              <AlertCircle className="w-6 h-6 text-maritime-red flex-shrink-0" />
              <div>
                <h3 className="font-bold text-maritime-red mb-2">Por favor corrige los siguientes errores:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="text-maritime-red">{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ======================== SECCIÓN 1: INFORMACIÓN DEL CURSO ======================== */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-navy/10 rounded-lg flex items-center justify-center">
                <Ship className="w-6 h-6 text-navy" />
              </div>
              <h2 className="text-2xl font-bold">Información del Curso</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="input-label">Título del Curso</label>
                <input type="text" name="courseName" value={formData.courseName} readOnly className="input-field bg-gray-100 cursor-not-allowed" />
              </div>
              <div>
                <label className="input-label">Fecha de Matrícula</label>
                <input type="date" name="courseDate" value={formData.courseDate} readOnly className="input-field bg-gray-100 cursor-not-allowed" />
              </div>
            </div>
          </div>

          {/* ======================== SECCIÓN 2: DATOS PERSONALES ======================== */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-navy/10 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-navy" />
              </div>
              <h2 className="text-2xl font-bold">Información Personal</h2>
            </div>
            <div className="space-y-6">
              {/* Nombre y Apellido */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Nombre <span className="text-maritime-red">*</span></label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Nombre e inicial del segundo nombre" className="input-field" required />
                </div>
                <div>
                  <label className="input-label">Apellido <span className="text-maritime-red">*</span></label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Apellidos" className="input-field" required />
                </div>
              </div>

              {/* Dirección Postal */}
              <div>
                <label className="input-label">Dirección Postal</label>
                <input type="text" name="postalAddress" value={formData.postalAddress} onChange={handleChange} placeholder="Calle, número, apartamento, PO Box" className="input-field" />
              </div>

              {/* Checkbox: misma dirección */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="sameAddress"
                  checked={sameAddress}
                  onChange={(e) => {
                    setSameAddress(e.target.checked);
                    if (!e.target.checked) setFormData(prev => ({ ...prev, physicalAddress: '' }));
                  }}
                  className="w-5 h-5 text-navy rounded border-gray-300 focus:ring-navy"
                />
                <label htmlFor="sameAddress" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Usar la misma dirección para la dirección física
                </label>
              </div>

              {/* Dirección Física */}
              <div>
                <label className="input-label">Dirección Física</label>
                <input
                  type="text"
                  name="physicalAddress"
                  value={sameAddress ? formData.postalAddress : formData.physicalAddress}
                  onChange={handleChange}
                  placeholder="Calle, número, urbanización"
                  className={`input-field ${sameAddress ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  readOnly={sameAddress}
                />
              </div>

              {/* Ciudad, País, Código Postal */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="input-label">Ciudad / Pueblo</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="San Juan" className="input-field" />
                </div>
                <div>
                  <label className="input-label">País</label>
                  <input type="text" name="country" value={formData.country} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="input-label">Código Postal</label>
                  <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} placeholder="00624" className="input-field" />
                </div>
              </div>

              {/* Teléfonos y Email */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="input-label">Teléfono <span className="text-maritime-red">*</span></label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="(787) 123-4567" className="input-field" required />
                </div>
                <div>
                  <label className="input-label">Celular</label>
                  <input type="tel" name="cellphone" value={formData.cellphone} onChange={handleChange} placeholder="(787) 987-6543" className="input-field" />
                </div>
                <div>
                  <label className="input-label">Email <span className="text-maritime-red">*</span></label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="tu@email.com" className="input-field" required />
                </div>
              </div>

              {/* Sexo, Fecha de Nacimiento, Menor de 18 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="input-label">Sexo <span className="text-maritime-red">*</span></label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="input-field" required>
                    <option value="">Selecciona...</option>
                    <option value="M">Masculino (M)</option>
                    <option value="F">Femenino (F)</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Fecha de Nacimiento <span className="text-maritime-red">*</span></label>
                  <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="input-field" required />
                </div>
                <div>
                  <label className="input-label">¿Menor de 18 años?</label>
                  <select name="isMinor" value={formData.isMinor} onChange={handleChange} className="input-field">
                    <option value="">Selecciona...</option>
                    <option value="Si">Sí</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

              {/* Campos de firma de padre/tutor (solo si es menor) */}
              {formData.isMinor === 'Si' && (
                <div className="bg-maritime-gold/10 border-2 border-maritime-gold rounded-lg p-6">
                  <h3 className="font-bold text-lg mb-4">Autorización de Padre/Madre o Guardián</h3>
                  <p className="text-gray-600 mb-4">
                    Como el estudiante es menor de 18 años, se requiere la firma de un padre, madre o guardián legal.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Firma de Padres o Guardián <span className="text-maritime-red">*</span></label>
                      <input type="text" name="parentGuardianSignature" value={formData.parentGuardianSignature} onChange={handleChange} placeholder="Nombre completo del padre/madre/guardián" className="input-field" />
                    </div>
                    <div>
                      <label className="input-label">Fecha de Firma <span className="text-maritime-red">*</span></label>
                      <input type="date" name="parentGuardianSignedAt" value={formData.parentGuardianSignedAt} readOnly className="input-field bg-gray-100 cursor-not-allowed" />
                    </div>
                  </div>
                </div>
              )}

              {/* Upload de Identificación Oficial */}
              <div className="bg-ice rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Upload className="w-5 h-5 text-navy" />
                  <h3 className="font-bold text-lg">Identificación Oficial</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Sube una foto o PDF de tu identificación oficial (Licencia, Real ID, Pasaporte).
                  Formatos aceptados: JPG, PNG, PDF. Tamaño máximo: {TAMANO_MAXIMO_MB} MB.
                </p>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                             file:rounded-lg file:border-0 file:text-sm file:font-semibold
                             file:bg-navy/10 file:text-navy hover:file:bg-navy/20
                             cursor-pointer"
                />
                {idFileError && <p className="text-maritime-red text-sm mt-2">{idFileError}</p>}
                {idFile && !idFileError && (
                  <p className="text-maritime-green text-sm mt-2">
                    Archivo seleccionado: {idFile.name} ({(idFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ======================== SECCIÓN 3: CARACTERÍSTICAS FÍSICAS ======================== */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-navy/10 rounded-lg flex items-center justify-center">
                <Ruler className="w-6 h-6 text-navy" />
              </div>
              <h2 className="text-2xl font-bold">Características Físicas</h2>
            </div>
            <p className="text-gray-600 mb-6">Requerida para certificación estatal</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="input-label">Color de Cabello</label>
                <input type="text" name="hairColor" value={formData.hairColor} onChange={handleChange} placeholder="Negro" className="input-field" />
              </div>
              <div>
                <label className="input-label">Color de Ojos</label>
                <input type="text" name="eyeColor" value={formData.eyeColor} onChange={handleChange} placeholder="Marrón" className="input-field" />
              </div>
              <div>
                <label className="input-label">Estatura (Pies)</label>
                <input type="number" name="heightFeet" value={formData.heightFeet} onChange={handleChange} placeholder="5" min="3" max="8" className="input-field" />
              </div>
              <div>
                <label className="input-label">Estatura (Pulgadas)</label>
                <input type="number" name="heightInches" value={formData.heightInches} onChange={handleChange} placeholder="10" min="0" max="11" className="input-field" />
              </div>
            </div>
          </div>

          {/* ======================== SECCIÓN 4: INFORMACIÓN DE LA EMBARCACIÓN ======================== */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-navy/10 rounded-lg flex items-center justify-center">
                <Ship className="w-6 h-6 text-navy" />
              </div>
              <h2 className="text-2xl font-bold">Información de la Embarcación</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label className="input-label">Tipo de Bote</label>
                <select name="boatType" value={formData.boatType} onChange={handleChange} className="input-field">
                  <option value="">Selecciona...</option>
                  <option value="Ninguno">Ninguno</option>
                  <option value="Outboard">Fuera de Borda (Outboard)</option>
                  <option value="IO">I/O</option>
                  <option value="Inboard">Intraborda (Inboard)</option>
                  <option value="Sail">Vela (Sail)</option>
                  <option value="PWC">PWC (Moto acuática)</option>
                  <option value="Paddle">Remo/Paleta (Paddle)</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Eslora (Largo)</label>
                  <select name="boatLength" value={formData.boatLength} onChange={handleChange} className="input-field">
                    <option value="">Selecciona...</option>
                    <option value="Menos de 16'">&lt; 16 pies</option>
                    <option value="16-25'">16-25 pies</option>
                    <option value="26-39'">26-39 pies</option>
                    <option value="40-54'">40-54 pies</option>
                    <option value="55'+">55+ pies</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">¿Tiene Remolque (Trailer)?</label>
                  <select name="hasTrailer" value={formData.hasTrailer} onChange={handleChange} className="input-field">
                    <option value="">Selecciona...</option>
                    <option value="Si">Sí</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Años de Experiencia Navegando</label>
                  <input type="number" name="yearsExperience" value={formData.yearsExperience} onChange={handleChange} placeholder="5" min="0" className="input-field" />
                </div>
                <div>
                  <label className="input-label">Potencia del Motor (HP)</label>
                  <input type="number" name="motorPower" value={formData.motorPower} onChange={handleChange} placeholder="150" min="0" className="input-field" />
                </div>
              </div>
            </div>
          </div>

          {/* ======================== SECCIÓN 5: PAGO CON STRIPE ======================== */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-navy/10 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-navy" />
              </div>
              <h2 className="text-2xl font-bold">Pago del Curso</h2>
            </div>

            <div className="bg-ice rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">Curso de Certificación de Navegación</p>
                  <p className="text-sm text-gray-600">Incluye examen y certificación</p>
                  <p className="text-sm text-gray-600">
                    Incluye libro de texto para recoger en Mayagüez o Cabo Rojo
                  </p>
                </div>
                <p className="text-2xl font-bold text-navy">$80.00</p>
              </div>

              <div className="border-t border-gray-300" />

              <div className="flex justify-between items-center">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="bookShipping"
                    checked={wantsBookShipping}
                    onChange={(e) => setWantsBookShipping(e.target.checked)}
                    className="mt-1 w-5 h-5 text-navy rounded border-gray-300 focus:ring-navy"
                  />
                  <label htmlFor="bookShipping" className="cursor-pointer">
                    <p className="font-semibold text-gray-800 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Enviar Libro de Texto por Correo
                    </p>
                    <p className="text-sm text-gray-600">Recibirás el libro de navegación en tu dirección postal</p>
                  </label>
                </div>
                <p className="text-xl font-bold text-navy">+$13.00</p>
              </div>

              <div className="border-t-2 border-navy" />

              <div className="flex justify-between items-center">
                <p className="text-xl font-bold text-navy">Total a Pagar</p>
                <p className="text-3xl font-bold text-navy">${wantsBookShipping ? '93.00' : '80.00'}</p>
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-4 text-center">
              Al hacer clic en el botón, serás redirigido a Stripe para completar tu pago de forma segura.
            </p>
          </div>

          {/* ======================== BOTÓN DE ENVÍO ======================== */}
          <div className="flex justify-center">
            <button type="submit" disabled={isProcessingPayment} className="btn-primary text-lg px-12 py-4 disabled:opacity-50">
              {isProcessingPayment ? 'Procesando...' : `Pagar $${wantsBookShipping ? '93.00' : '80.00'} y Enviar Matrícula`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
