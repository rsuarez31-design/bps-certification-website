/**
 * PÁGINA DE MATRÍCULA DIGITAL
 * 
 * Esta página contiene el formulario de inscripción para el curso de navegación.
 * El formulario está organizado en secciones según el documento original:
 * - Información Personal
 * - Características Físicas
 * - Información de la Embarcación
 */

'use client';

import { useState } from 'react';
import { User, Ruler, Ship, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * INTERFAZ PARA LOS DATOS DEL FORMULARIO
 * Define la estructura de todos los campos del formulario
 */
interface FormData {
  // Información del curso
  courseName: string;
  courseDate: string;
  
  // Datos personales
  fullName: string;
  nickname: string;
  address: string;
  city: string;
  county: string;
  state: string;
  zipCode: string;
  phone: string;
  cellphone: string;
  email: string;
  gender: string;
  birthDate: string;
  isMinor: string;
  
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
  
  // Información adicional
  howHeard: string;
  onlineExamPin: string;
}

export default function MatriculaPage() {
  /**
   * Estado para manejar todos los datos del formulario
   * Inicialmente todos los campos están vacíos
   */
  const [formData, setFormData] = useState<FormData>({
    courseName: '',
    courseDate: '',
    fullName: '',
    nickname: '',
    address: '',
    city: '',
    county: '',
    state: 'Puerto Rico',
    zipCode: '',
    phone: '',
    cellphone: '',
    email: '',
    gender: '',
    birthDate: '',
    isMinor: '',
    hairColor: '',
    eyeColor: '',
    heightFeet: '',
    heightInches: '',
    boatType: '',
    boatLength: '',
    hasTrailer: '',
    yearsExperience: '',
    motorPower: '',
    howHeard: '',
    onlineExamPin: '',
  });

  /**
   * Estado para controlar si el formulario fue enviado con éxito
   */
  const [isSubmitted, setIsSubmitted] = useState(false);

  /**
   * Estado para mostrar errores de validación
   */
  const [errors, setErrors] = useState<string[]>([]);

  /**
   * FUNCIÓN PARA MANEJAR CAMBIOS EN LOS INPUTS
   * 
   * Esta función se ejecuta cada vez que el usuario escribe en un campo.
   * Actualiza el estado con el nuevo valor.
   * 
   * @param e - Evento del input que cambió
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev, // Mantiene todos los valores anteriores
      [name]: value, // Actualiza solo el campo que cambió
    }));
  };

  /**
   * FUNCIÓN PARA VALIDAR EL FORMULARIO
   * 
   * Verifica que los campos obligatorios estén completos.
   * 
   * @returns true si el formulario es válido, false si hay errores
   */
  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    // Validar campos obligatorios
    if (!formData.fullName.trim()) newErrors.push('Nombre completo es obligatorio');
    if (!formData.email.trim()) newErrors.push('Correo electrónico es obligatorio');
    if (!formData.phone.trim()) newErrors.push('Teléfono es obligatorio');
    if (!formData.birthDate) newErrors.push('Fecha de nacimiento es obligatoria');
    if (!formData.gender) newErrors.push('Sexo es obligatorio');

    // Validar email con expresión regular
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.push('Correo electrónico no es válido');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  /**
   * FUNCIÓN PARA MANEJAR EL ENVÍO DEL FORMULARIO
   * 
   * @param e - Evento del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario

    // Validar el formulario
    if (!validateForm()) {
      // Scroll hacia arriba para ver los errores
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Simular envío de datos
    // En producción, aquí harías una llamada a tu API
    console.log('Datos del formulario:', formData);

    // Guardar en localStorage para demostración
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    students.push({
      ...formData,
      id: Date.now(),
      submittedAt: new Date().toISOString(),
    });
    localStorage.setItem('students', JSON.stringify(students));

    // Mostrar mensaje de éxito
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * SI EL FORMULARIO FUE ENVIADO CON ÉXITO, MOSTRAR MENSAJE
   */
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-ice py-20">
        <div className="container-custom max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Icono de éxito */}
            <div className="w-20 h-20 bg-maritime-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-maritime-green" />
            </div>
            
            <h1 className="text-3xl font-bold text-navy mb-4">
              ¡Matrícula Enviada con Éxito!
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              Hemos recibido tu información. Te contactaremos pronto con los detalles 
              del curso y la fecha del examen.
            </p>
            
            <div className="bg-ice rounded-lg p-6 mb-8">
              <p className="text-gray-700 mb-2">
                <strong>Nombre:</strong> {formData.fullName}
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Email:</strong> {formData.email}
              </p>
              <p className="text-gray-700">
                <strong>Teléfono:</strong> {formData.phone}
              </p>
            </div>

            <button
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  courseName: '',
                  courseDate: '',
                  fullName: '',
                  nickname: '',
                  address: '',
                  city: '',
                  county: '',
                  state: 'Puerto Rico',
                  zipCode: '',
                  phone: '',
                  cellphone: '',
                  email: '',
                  gender: '',
                  birthDate: '',
                  isMinor: '',
                  hairColor: '',
                  eyeColor: '',
                  heightFeet: '',
                  heightInches: '',
                  boatType: '',
                  boatLength: '',
                  hasTrailer: '',
                  yearsExperience: '',
                  motorPower: '',
                  howHeard: '',
                  onlineExamPin: '',
                });
              }}
              className="btn-primary"
            >
              Enviar Otra Matrícula
            </button>
          </div>
        </div>
      </div>
    );
  }

  /**
   * RENDERIZAR EL FORMULARIO
   */
  return (
    <div className="min-h-screen bg-ice py-12">
      <div className="container-custom max-w-4xl">
        {/* Encabezado de la página */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-navy mb-4">
            Formulario de Matrícula
          </h1>
          <p className="text-xl text-gray-600">
            Completa este formulario para inscribirte en el curso de navegación
          </p>
        </div>

        {/* Mostrar errores si los hay */}
        {errors.length > 0 && (
          <div className="bg-maritime-red/10 border-2 border-maritime-red rounded-lg p-6 mb-8">
            <div className="flex gap-3">
              <AlertCircle className="w-6 h-6 text-maritime-red flex-shrink-0" />
              <div>
                <h3 className="font-bold text-maritime-red mb-2">
                  Por favor corrige los siguientes errores:
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="text-maritime-red">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* 
            ==========================================
            SECCIÓN 1: INFORMACIÓN DEL CURSO
            ==========================================
          */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-navy/10 rounded-lg flex items-center justify-center">
                <Ship className="w-6 h-6 text-navy" />
              </div>
              <h2 className="text-2xl font-bold">Información del Curso</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Título del Curso */}
              <div>
                <label className="input-label">
                  Título del Curso
                </label>
                <input
                  type="text"
                  name="courseName"
                  value={formData.courseName}
                  onChange={handleChange}
                  placeholder="Ej: Curso Básico de Navegación"
                  className="input-field"
                />
              </div>

              {/* Fecha */}
              <div>
                <label className="input-label">
                  Fecha
                </label>
                <input
                  type="date"
                  name="courseDate"
                  value={formData.courseDate}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* 
            ==========================================
            SECCIÓN 2: DATOS PERSONALES
            ==========================================
          */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-navy/10 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-navy" />
              </div>
              <h2 className="text-2xl font-bold">Información Personal</h2>
            </div>

            <div className="space-y-6">
              {/* Nombre Completo */}
              <div>
                <label className="input-label">
                  Nombre Completo <span className="text-maritime-red">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Nombre, inicial del segundo nombre y apellidos"
                  className="input-field"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Incluye nombre, inicial del segundo nombre y apellidos
                </p>
              </div>

              {/* Apodo */}
              <div>
                <label className="input-label">
                  Apodo
                </label>
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  placeholder="Nombre por el que te conocen"
                  className="input-field"
                />
              </div>

              {/* Dirección */}
              <div>
                <label className="input-label">
                  Dirección <span className="text-maritime-red">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Calle, número, apartamento"
                  className="input-field"
                />
              </div>

              {/* Ciudad, Condado, Estado, Código Postal */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="input-label">Ciudad</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="San Juan"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="input-label">Condado</label>
                  <input
                    type="text"
                    name="county"
                    value={formData.county}
                    onChange={handleChange}
                    placeholder="Cabo Rojo"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="input-label">Estado</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="input-label">Código Postal</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    placeholder="00624"
                    className="input-field"
                  />
                </div>
              </div>

              {/* Teléfonos y Email */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="input-label">
                    Teléfono <span className="text-maritime-red">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(787) 123-4567"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="input-label">Celular</label>
                  <input
                    type="tel"
                    name="cellphone"
                    value={formData.cellphone}
                    onChange={handleChange}
                    placeholder="(787) 987-6543"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="input-label">
                    Email <span className="text-maritime-red">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    className="input-field"
                    required
                  />
                </div>
              </div>

              {/* Sexo, Fecha de Nacimiento, Menor de 18 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="input-label">
                    Sexo <span className="text-maritime-red">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="">Selecciona...</option>
                    <option value="M">Masculino (M)</option>
                    <option value="F">Femenino (F)</option>
                  </select>
                </div>

                <div>
                  <label className="input-label">
                    Fecha de Nacimiento <span className="text-maritime-red">*</span>
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="input-label">¿Menor de 18 años?</label>
                  <select
                    name="isMinor"
                    value={formData.isMinor}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Selecciona...</option>
                    <option value="Si">Sí</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 
            ==========================================
            SECCIÓN 3: DESCRIPCIÓN FÍSICA
            ==========================================
          */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-navy/10 rounded-lg flex items-center justify-center">
                <Ruler className="w-6 h-6 text-navy" />
              </div>
              <h2 className="text-2xl font-bold">Características Físicas</h2>
            </div>

            <p className="text-gray-600 mb-6">
              Requerida para certificación estatal
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Color de Cabello */}
              <div>
                <label className="input-label">Color de Cabello</label>
                <input
                  type="text"
                  name="hairColor"
                  value={formData.hairColor}
                  onChange={handleChange}
                  placeholder="Negro"
                  className="input-field"
                />
              </div>

              {/* Color de Ojos */}
              <div>
                <label className="input-label">Color de Ojos</label>
                <input
                  type="text"
                  name="eyeColor"
                  value={formData.eyeColor}
                  onChange={handleChange}
                  placeholder="Marrón"
                  className="input-field"
                />
              </div>

              {/* Estatura - Pies */}
              <div>
                <label className="input-label">Estatura (Pies)</label>
                <input
                  type="number"
                  name="heightFeet"
                  value={formData.heightFeet}
                  onChange={handleChange}
                  placeholder="5"
                  min="3"
                  max="8"
                  className="input-field"
                />
              </div>

              {/* Estatura - Pulgadas */}
              <div>
                <label className="input-label">Estatura (Pulgadas)</label>
                <input
                  type="number"
                  name="heightInches"
                  value={formData.heightInches}
                  onChange={handleChange}
                  placeholder="10"
                  min="0"
                  max="11"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* 
            ==========================================
            SECCIÓN 4: INFORMACIÓN DE LA EMBARCACIÓN
            ==========================================
          */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-navy/10 rounded-lg flex items-center justify-center">
                <Ship className="w-6 h-6 text-navy" />
              </div>
              <h2 className="text-2xl font-bold">Información de la Embarcación</h2>
            </div>

            <div className="space-y-6">
              {/* Tipo de Bote */}
              <div>
                <label className="input-label">Tipo de Bote</label>
                <select
                  name="boatType"
                  value={formData.boatType}
                  onChange={handleChange}
                  className="input-field"
                >
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

              {/* Eslora y Remolque */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Eslora (Largo)</label>
                  <select
                    name="boatLength"
                    value={formData.boatLength}
                    onChange={handleChange}
                    className="input-field"
                  >
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
                  <select
                    name="hasTrailer"
                    value={formData.hasTrailer}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Selecciona...</option>
                    <option value="Si">Sí</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

              {/* Años de Experiencia y Potencia del Motor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Años de Experiencia Navegando</label>
                  <input
                    type="number"
                    name="yearsExperience"
                    value={formData.yearsExperience}
                    onChange={handleChange}
                    placeholder="5"
                    min="0"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="input-label">Potencia del Motor (HP)</label>
                  <input
                    type="number"
                    name="motorPower"
                    value={formData.motorPower}
                    onChange={handleChange}
                    placeholder="150"
                    min="0"
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 
            ==========================================
            SECCIÓN 5: INFORMACIÓN ADICIONAL
            ==========================================
          */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Información Adicional</h2>

            <div className="space-y-6">
              {/* ¿Cómo se enteró del curso? */}
              <div>
                <label className="input-label">¿Cómo se enteró del curso?</label>
                <select
                  name="howHeard"
                  value={formData.howHeard}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Selecciona...</option>
                  <option value="News">Noticias/Revista</option>
                  <option value="TV">TV</option>
                  <option value="Radio">Radio</option>
                  <option value="Web">Internet/Web</option>
                  <option value="Booth">Stand/Booth</option>
                  <option value="Word">Recomendación</option>
                  <option value="Poster">Póster/Literatura</option>
                </select>
              </div>

              {/* PIN para examen en línea */}
              <div>
                <label className="input-label">
                  PIN para Examen en Línea
                </label>
                <input
                  type="text"
                  name="onlineExamPin"
                  value={formData.onlineExamPin}
                  onChange={handleChange}
                  placeholder="Para estudiantes de ABC3 que requieren examen presencial supervisado"
                  className="input-field"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Solo para estudiantes que requieren examen presencial supervisado
                </p>
              </div>
            </div>
          </div>

          {/* 
            ==========================================
            BOTÓN DE ENVÍO
            ==========================================
          */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="btn-primary text-lg px-12 py-4"
            >
              Enviar Matrícula
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
