/**
 * Validación de campos obligatorios de matrícula (online y manual).
 */

export type RegistrationRequiredFields = {
  full_name: string;
  last_name: string;
  email: string;
  phone: string;
  birth_date: string;
  gender: string;
  is_minor?: boolean;
  parent_guardian_signature?: string;
  hair_color: string;
  eye_color: string;
  height_feet: string | number;
  height_inches: string | number;
};

export function validateRequiredRegistrationFields(fields: RegistrationRequiredFields): string[] {
  const errors: string[] = [];

  if (!fields.full_name.trim()) errors.push('Nombre es obligatorio');
  if (!fields.last_name.trim()) errors.push('Apellido es obligatorio');
  if (!fields.email.trim()) errors.push('Correo electrónico es obligatorio');
  if (!fields.phone.trim()) errors.push('Teléfono es obligatorio');
  if (!fields.birth_date) errors.push('Fecha de nacimiento es obligatoria');
  if (!fields.gender) errors.push('Sexo es obligatorio');

  if (fields.is_minor && !String(fields.parent_guardian_signature ?? '').trim()) {
    errors.push('Firma de padres o guardián es obligatoria para menores de edad');
  }

  if (!fields.hair_color.trim()) errors.push('Color de cabello es obligatorio');
  if (!fields.eye_color.trim()) errors.push('Color de ojos es obligatorio');
  if (fields.height_feet === '' || fields.height_feet === null || fields.height_feet === undefined) {
    errors.push('Estatura (pies) es obligatoria');
  }
  if (
    fields.height_inches === '' ||
    fields.height_inches === null ||
    fields.height_inches === undefined
  ) {
    errors.push('Estatura (pulgadas) es obligatoria');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (fields.email.trim() && !emailRegex.test(fields.email.trim())) {
    errors.push('El correo electrónico no tiene un formato válido (ej: nombre@correo.com)');
  }

  const phoneDigits = fields.phone.replace(/\D/g, '');
  if (fields.phone.trim() && phoneDigits.length < 7) {
    errors.push('El teléfono debe tener al menos 7 dígitos');
  }

  if (fields.birth_date) {
    const birthYear = new Date(fields.birth_date).getFullYear();
    const currentYear = new Date().getFullYear();
    if (birthYear < 1920 || birthYear > currentYear) {
      errors.push('La fecha de nacimiento no parece correcta');
    }
  }

  return errors;
}
