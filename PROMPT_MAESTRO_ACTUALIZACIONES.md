# PROMPT MAESTRO: Actualizaciones BPS v2.0

> **Copia y pega este prompt completo en una nueva conversación para ejecutar todos los cambios.**

---

## INSTRUCCIONES GLOBALES

Actúa como un Senior Full-Stack Developer. Vas a implementar una serie de actualizaciones al sitio web de Americas Boating Club - Boquerón Power Squadron (BPS). El proyecto usa Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase y Stripe.

**Reglas obligatorias:**

1. **Idioma**: Todo el contenido visible del sitio web, comentarios de código y mensajes de error deben estar en español. Los comentarios deben ser claros y comprensibles para personas no técnicas.
2. **Diseño**: Mantén el estilo visual tropical/caribeño actual (colores navy, ocean, maritime-gold, sand). No cambies la estética general. Asegura contraste legible en todos los textos.
3. **No eliminar páginas**: No elimines ninguna página o ruta existente sin aprobación explícita.
4. **Validaciones**: Todas las validaciones de formularios deben ser robustas tanto en frontend como en backend.
5. **Seguridad**: Usa las mejores prácticas. Los datos sensibles de estudiantes solo deben leerse con `supabaseAdmin` (service_role) desde rutas API del servidor, nunca desde el cliente.
6. **Persistencia**: Mantén el flujo actual de matrícula `pending -> paid` (crear registro al iniciar checkout, confirmar con webhook de Stripe).
7. **Build limpio**: Al terminar cada módulo, ejecuta `npm run build` para verificar que no haya errores.

---

## MÓDULO 1: PÁGINA PRINCIPAL (Landing Page)

### Archivos a modificar:
- `app/page.tsx`
- `components/Footer.tsx`

### Cambio 1.1 — Texto de "Certificación Oficial"
En `app/page.tsx`, la sección "Qué Incluye Nuestro Curso", el bloque con título "Certificación Oficial" (línea ~164) tiene actualmente:
```
Al aprobar, recibes tu certificado digital oficial reconocido por el DRNA de Puerto Rico.
```
**Reemplazar por:**
```
Al aprobar este curso recibes tu certificado digital oficial reconocido por el DRNA de Puerto Rico.
```

### Cambio 1.2 — Texto de "Libro De Texto"
En la misma sección, el bloque "Libro De Texto" (línea ~179) tiene actualmente:
```
En el libro encontrarás toda la información necesaria para aprobar el curso y referencias para uso futuro.
```
Este texto ya es correcto. **Verificar que esté exactamente así y no tocarlo.**

### Cambio 1.3 — Eliminar Dirección Física y Teléfono del Footer
En `components/Footer.tsx`, la Columna 4 "Contacto" (líneas ~100-126) muestra actualmente:
- MapPin: "Boquerón, Puerto Rico"
- Mail: "info@boqueron-squadron.org"
- Phone: "(787) 123-4567"

**Eliminar** las entradas de `MapPin` (dirección física) y `Phone` (teléfono). Dejar únicamente el email con el icono `Mail`. Eliminar los imports no utilizados (`MapPin`, `Phone`) de lucide-react.

La Landing Page (`app/page.tsx`) no tiene sección de contacto propia, así que no requiere cambios adicionales en ese sentido.

---

## MÓDULO 2: MATRÍCULA (Formulario de Inscripción)

### Archivos a modificar:
- `app/matricula/page.tsx`
- `app/api/stripe/checkout/route.ts`
- `supabase/schema.sql` (nueva migración)
- `app/admin/page.tsx` (nueva tabla de configuración)

### Cambio 2.1 — Título Dinámico del Curso
El título del curso debe seguir el formato: **"Curso Básico De Navegación ABC - [Mes] - [Año]"**. Los valores de Mes y Año deben ser configurables desde el Panel Administrativo.

**Implementación:**

1. Crear una nueva tabla en Supabase llamada `site_config`:
```sql
CREATE TABLE IF NOT EXISTS site_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  course_month TEXT NOT NULL DEFAULT 'Enero',
  course_year TEXT NOT NULL DEFAULT '2026',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO site_config (id, course_month, course_year)
VALUES ('default', 'Enero', '2026')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquier persona puede leer la configuración"
  ON site_config FOR SELECT USING (true);

CREATE POLICY "Solo servicio puede actualizar configuración"
  ON site_config FOR UPDATE USING (auth.role() = 'service_role');
```

2. En `app/matricula/page.tsx`:
   - Al cargar la página, hacer fetch a `site_config` desde Supabase para obtener `course_month` y `course_year`.
   - Construir el título: `Curso Básico De Navegación ABC - ${course_month} - ${course_year}`.
   - Mostrar este título en el campo "Título del Curso" como **read-only** (el usuario no lo puede editar).
   - Eliminar el `placeholder` actual de ese campo.

3. En el Panel Administrativo (Cambio 4.4), agregar interfaz para editar estos valores.

### Cambio 2.2 — Fechas Automáticas (Read-Only)
- **Fecha de matrícula** (`courseDate`): Capturar automáticamente la fecha actual del sistema al cargar la página. El campo debe mostrarse con la fecha y estar bloqueado (`readOnly`).
- **Fecha de firma de padre/tutor** (`parentGuardianSignedAt`): Cuando el bloque de firma del padre/tutor sea visible (menor de edad), la fecha debe llenarse automáticamente con la fecha actual y ser `readOnly`.

**Implementación:**
```typescript
// Al inicializar el estado del formulario:
const hoy = new Date().toISOString().split('T')[0]; // formato YYYY-MM-DD

const [formData, setFormData] = useState<FormData>({
  // ...
  courseDate: hoy,              // Fecha actual automática
  parentGuardianSignedAt: hoy,  // Se usa si es menor
  // ...
});
```
En los inputs correspondientes, agregar `readOnly` y una clase visual de "deshabilitado" (ej: `bg-gray-100 cursor-not-allowed`).

### Cambio 2.3 — Ajustes de Campos del Formulario
En la interfaz `FormData` y el formulario HTML:

| Campo actual | Acción | Campo nuevo |
|---|---|---|
| `nickname` ("Apodo") | Renombrar | `lastName` ("Apellido") — marcar como obligatorio (*) |
| `county` ("Condado") | Eliminar | N/A |
| `state` ("Estado") | Renombrar | `country` ("País") — valor por defecto: "Puerto Rico" |

**En la interfaz FormData:**
- Cambiar `nickname: string` → `lastName: string`
- Eliminar `county: string`
- Cambiar `state: string` → `country: string`

**En el HTML del formulario:**
- Donde dice "Apodo" → poner "Apellido" con label `<span className="text-maritime-red">*</span>`
- Donde dice "Nombre Completo" → cambiar placeholder a "Nombre e inicial del segundo nombre"
- Eliminar el campo "Condado" del grid
- Cambiar "Estado" por "País"
- Ajustar el grid de `lg:grid-cols-4` a `lg:grid-cols-3` (ya que Condado se elimina)

**En el INSERT a Supabase:**
- Cambiar `nickname` → `last_name`
- Eliminar `county`
- Cambiar `state` → `country`

**En la validación:**
- Agregar: `if (!formData.lastName.trim()) newErrors.push('Apellido es obligatorio');`

### Cambio 2.4 — Dirección Postal y Dirección Física
Reemplazar el campo único "Dirección" (`address`) por dos campos:
- **Dirección Postal** (`postalAddress`)
- **Dirección Física** (`physicalAddress`)

Agregar un **checkbox**: "Usar la misma dirección para ambas". Cuando esté marcado:
- Copiar automáticamente el valor de `postalAddress` a `physicalAddress`.
- Hacer `physicalAddress` read-only con apariencia deshabilitada.
- Cuando se desmarque, limpiar `physicalAddress` y habilitarlo.

**En FormData:**
```typescript
postalAddress: string;
physicalAddress: string;
sameAddress: boolean;   // estado del checkbox (no se guarda en DB como campo aparte)
```

**En el INSERT a Supabase:**
- Cambiar `address` → `postal_address` y agregar `physical_address`

### Cambio 2.5 — Upload de Identificación Oficial
Implementar un campo de **carga de archivos** para identificación oficial (Licencia, Real ID, Pasaporte, etc.).

**Implementación:**
1. Crear un **Supabase Storage bucket** llamado `id-documents` (privado).
2. En el formulario, agregar un input `type="file"` que acepte:
   - Formatos: `.jpg`, `.jpeg`, `.png`, `.pdf`
   - Tamaño máximo: **5 MB**
3. Mostrar validación si el archivo excede el tamaño o tiene formato inválido.
4. Al enviar el formulario (antes de redirigir a Stripe):
   - Subir el archivo a Supabase Storage con nombre único: `${registrationId}_${timestamp}.${ext}`
   - Guardar la ruta del archivo en la columna `id_document_path` de la tabla `registrations`.
5. Mostrar preview del archivo seleccionado (nombre + tamaño).

**Nueva columna SQL:**
```sql
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS id_document_path TEXT DEFAULT '';
```

**Políticas de Storage:**
- INSERT: cualquiera puede subir (para el registro).
- SELECT: solo `service_role` (proteger documentos de identidad).

### Cambio 2.6 — Costo de Shipping del Libro
Cambiar el costo de envío del libro de **$10.00 a $13.00**.

**Archivos afectados:**
- `app/matricula/page.tsx`:
  - Línea ~214: cambiar `9000` → `9300` (totalCents cuando incluye shipping)
  - Línea ~646: cambiar `+$10.00` → `+$13.00`
  - Línea ~656: cambiar `'90.00'` → `'93.00'`
  - Línea ~673: cambiar `'90.00'` → `'93.00'`
- `app/api/stripe/checkout/route.ts`:
  - Línea ~60: cambiar `unit_amount: 1000` → `unit_amount: 1300`

---

## MÓDULO 3: SISTEMA DE EXAMEN (Lógica y Seguridad)

### Archivos a modificar:
- `app/examen/page.tsx`
- `supabase/schema.sql` (migración para nuevas columnas)
- Nueva ruta API: `app/api/exam/validate-access/route.ts`

### Cambio 3.1 — Protección de Contenido (Best-Effort)
Agregar al componente de examen en progreso las siguientes protecciones del lado del cliente:

```typescript
// Dentro de un useEffect cuando examStatus === 'in-progress':

// 1. Desactivar clic derecho (context menu)
const bloquearContextMenu = (e: Event) => e.preventDefault();
document.addEventListener('contextmenu', bloquearContextMenu);

// 2. Detectar e impedir intento de impresión (Ctrl+P / Cmd+P)
const bloquearImpresion = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
    e.preventDefault();
    alert('La impresión no está permitida durante el examen.');
  }
};
document.addEventListener('keydown', bloquearImpresion);

// 3. Detectar intento de captura de pantalla (PrintScreen)
const bloquearCaptura = (e: KeyboardEvent) => {
  if (e.key === 'PrintScreen') {
    e.preventDefault();
    alert('Las capturas de pantalla no están permitidas durante el examen.');
  }
};
document.addEventListener('keydown', bloquearCaptura);

// Limpiar al desmontar:
return () => {
  document.removeEventListener('contextmenu', bloquearContextMenu);
  document.removeEventListener('keydown', bloquearImpresion);
  document.removeEventListener('keydown', bloquearCaptura);
};
```

**Nota importante:** Estas protecciones son "best-effort" (se pueden evadir). Son una barrera disuasiva, no una solución infalible. Documentar esto en un comentario del código.

### Cambio 3.2 — Bloqueo de Dispositivos Móviles
El examen oficial solo debe ser accesible desde **Desktop o Tablets** (pantalla >= 768px de ancho). Bloquear smartphones.

**Implementación:**
- Al inicio de `ExamenPage`, antes de mostrar cualquier contenido, detectar el ancho de pantalla.
- Si `window.innerWidth < 768`, mostrar un mensaje bloqueante:
  ```
  "Este examen solo está disponible en computadoras de escritorio o tablets.
   Por favor, accede desde un dispositivo con pantalla más grande."
  ```
- Usar un `useEffect` con `resize` listener para detectar si la ventana cambia de tamaño.
- NO mostrar ningún contenido del examen (ni el formulario de nombre, ni nada) si el dispositivo es móvil.

### Cambio 3.3 — Nueva Lógica de Reintentos (Reemplaza la actual)
**Eliminar completamente** la lógica actual de "Intenta De Nuevo" (que se activa con 7+ incorrectas y bloquea/acepta la siguiente respuesta diferente).

**Reemplazar con la siguiente lógica nueva:**

- Llevar un contador de respuestas incorrectas en tiempo real (`wrongCount`).
- Cuando el estudiante selecciona una respuesta:
  1. Si es correcta → aceptar normalmente.
  2. Si es incorrecta Y `wrongCount >= 10`:
     - **NO aceptar** la respuesta inmediatamente.
     - Mostrar un aviso: "Tu respuesta es incorrecta. Tienes 1 oportunidad más para esta pregunta."
     - Permitir que seleccione **una opción diferente** como reintento.
     - Aceptar ese segundo intento sin importar si es correcto o incorrecto.
     - Si elige la misma opción del primer intento, volver a mostrar el aviso.
  3. Si es incorrecta Y `wrongCount < 10`:
     - Aceptar normalmente (sin aviso).

**Eliminar:** la interfaz `BlockedAttempts`, el estado `blockedAttempts`, el estado `retryMessage`, y toda la lógica condicional asociada a `wrongCount >= 7`.

**Crear nuevos estados:**
```typescript
// Guarda si una pregunta está en modo "reintento" y cuál fue la opción inicial
const [reintentoActivo, setReintentoActivo] = useState<{
  questionId: number;
  opcionInicial: number;
} | null>(null);

// Mensaje de reintento visible
const [mensajeReintento, setMensajeReintento] = useState<string | null>(null);
```

### Cambio 3.4 — Resultados tras Fracaso (NO mostrar respuesta correcta)
Actualmente, cuando el estudiante reprueba, la sección de revisión muestra tanto la respuesta del estudiante como la respuesta correcta (con borde verde y texto "Respuesta Correcta").

**Cambiar para que:**
- Se muestren las preguntas que falló.
- Se muestre cuál fue SU contestación (marcada en rojo).
- **NO se muestre cuál era la respuesta correcta** (eliminar el borde verde, el texto "Respuesta Correcta" y cualquier indicación visual de la opción correcta).

En la sección de revisión de `wrongQuestions.map(...)`, cambiar la lógica de estilos:
```typescript
// ANTES: las opciones correctas se marcaban con verde
// AHORA: solo marcar la opción del estudiante en rojo, las demás en gris neutro
const isStudentChoice = optIndex === studentAnswer;
// Eliminar: const isCorrectOpt = optIndex === question.correctAnswer;

className={`p-3 rounded-lg ${
  isStudentChoice
    ? 'bg-maritime-red/20 border-2 border-maritime-red'
    : 'bg-gray-100'
}`}
```

Eliminar la etiqueta `"Respuesta Correcta"` completamente. Mantener solo `"Tu Contestación"` para la opción del estudiante.

### Cambio 3.5 — Temporizador de 3 Horas
Implementar un temporizador descendente de **3 horas (10,800 segundos)** que se muestra durante el examen.

**Implementación:**
- Estado: `const [tiempoRestante, setTiempoRestante] = useState(3 * 60 * 60);` (en segundos)
- `useEffect` con `setInterval` de 1 segundo que decrementa el contador.
- Mostrar en formato `HH:MM:SS` en la barra superior del examen (junto al progreso).
- Si `tiempoRestante` llega a los últimos 10 minutos (600 segundos), cambiar el color del timer a rojo y agregar animación `animate-pulse`.
- Si `tiempoRestante` llega a 0:
  - Llamar automáticamente a `finishExam()` sin confirmación.
  - Las preguntas sin responder se contarán como incorrectas.
  - Mostrar un mensaje adicional en los resultados: "El tiempo del examen expiró."

### Cambio 3.6 — Expiración de 24 Horas y Máximo 3 Intentos
El examen oficial expira **24 horas después de que el estudiante completó la matrícula** y el pago. Dentro de ese periodo, tiene un **máximo de 3 intentos**.

**Implementación:**

1. **Nueva ruta API** `app/api/exam/validate-access/route.ts`:
   - Recibe `email` del estudiante.
   - Usa `supabaseAdmin` para consultar `registrations` con ese email y `payment_status = 'paid'`.
   - Si no hay matrícula pagada → devolver `{ allowed: false, reason: 'No se encontró una matrícula pagada con este email.' }`
   - Si la matrícula tiene más de 24 horas (comparar `created_at` con `NOW()`) → devolver `{ allowed: false, reason: 'Tu periodo de 24 horas para tomar el examen ha expirado. Contacta al administrador.' }`
   - Contar intentos de tipo 'oficial' en `exam_attempts` con ese email en las últimas 24 horas.
   - Si hay 3 o más → devolver `{ allowed: false, reason: 'Has alcanzado el máximo de 3 intentos permitidos.' }`
   - Si todo está bien → devolver `{ allowed: true, attemptsUsed: N, registrationId: '...' }`

2. **En `app/examen/page.tsx`:**
   - En la pantalla "not-started", agregar un campo de **Email** además del nombre.
   - Al hacer clic en "Comenzar Examen", llamar primero a `/api/exam/validate-access` con el email.
   - Si `allowed: false`, mostrar el `reason` como error y no iniciar el examen.
   - Si `allowed: true`, mostrar cuántos intentos ha usado: "Intento X de 3".
   - Guardar el `student_email` y `registration_id` en el INSERT a `exam_attempts` al finalizar.

3. **Nuevas columnas SQL** (ya existen `student_email` y `registration_id` en el schema, verificar que se usen):
   - Asegurar que `exam_attempts.student_email` se llene correctamente al guardar resultados.

---

## MÓDULO 4: PANEL ADMINISTRATIVO

### Archivos a modificar:
- `app/admin/page.tsx`
- Nueva ruta API: `app/api/admin/registrations/route.ts` (lectura segura con service_role)
- Nueva ruta API: `app/api/admin/tracking/route.ts` (actualizar tracking number)
- Nueva ruta API: `app/api/admin/config/route.ts` (leer/actualizar configuración del curso)

### Cambio 4.1 — Vista Principal de Matrículas
La tabla de matrículas actualmente muestra nombre, email y estado de pago en las tarjetas colapsables.

**Cambiar a una tabla con columnas visibles:**

| Columna | Campo de DB |
|---|---|
| Nombre | `full_name` |
| Apellido | `last_name` (nuevo campo, ver Cambio 2.3) |
| Teléfono | `phone` |
| Pueblo/Ciudad | `city` |
| Email | `email` |
| Estado Pago | `payment_status` (badge de color) |
| Acciones | Botón "Ver Detalles" |

Cambiar de tarjetas colapsables a una **tabla HTML responsiva** similar a la tabla de Exámenes.

### Cambio 4.2 — Vista de Detalles de Matrícula
Al hacer clic en "Ver Detalles", abrir un **modal o panel lateral** que muestre TODA la información del formulario de inscripción organizada en secciones:

- **Información del Curso**: título, fecha de matrícula.
- **Datos Personales**: nombre, apellido, dirección postal, dirección física, ciudad, país, código postal, teléfono, celular, email, sexo, fecha de nacimiento, menor de edad (sí/no), firma de padre/tutor (si aplica).
- **Características Físicas**: cabello, ojos, estatura.
- **Embarcación**: tipo, eslora, remolque, experiencia, motor.
- **Documento de ID**: mostrar link para descargar/ver el archivo subido. Si es imagen, mostrar preview. Si es PDF, mostrar botón de descarga.
- **Pago**: monto total, estado, IDs de Stripe.
- **Tracking Number**: campo editable (ver Cambio 4.3).

**Importante:** Los datos de matrículas deben cargarse desde una ruta API del servidor (`/api/admin/registrations`) que use `supabaseAdmin` (service_role), porque la política RLS actual solo permite lectura con service_role. El cliente admin actual usa `supabase` (anon key) que no tiene permiso de lectura sobre `registrations`. **Corregir este flujo.**

### Cambio 4.3 — Campo de Tracking Number
En la vista de detalles de cada matrícula:
- Mostrar un campo de texto editable para el "Número de Rastreo (Tracking Number)".
- Al lado, un botón "Guardar" que llame a `/api/admin/tracking` para actualizar el campo en Supabase.
- Solo visible si `wants_book_shipping === true`.

**Nueva columna SQL:**
```sql
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS tracking_number TEXT DEFAULT '';
```

**Nueva ruta API** `app/api/admin/tracking/route.ts`:
- Método PUT.
- Recibe `{ registrationId, trackingNumber }`.
- Actualiza `tracking_number` en `registrations` usando `supabaseAdmin`.
- Retorna éxito o error.

### Cambio 4.4 — Filtro por Sección de Curso (Mes y Año)
Agregar filtros dropdown en la pestaña de Matrículas:
- **Mes**: Enero, Febrero, ..., Diciembre, Todos
- **Año**: 2025, 2026, 2027, Todos

Filtrar las matrículas por el campo `course_name` que contiene el mes y año (ej: "Curso Básico De Navegación ABC - Enero - 2026").

### Cambio 4.5 — Configuración del Curso (Mes/Año)
Agregar una nueva pestaña o sección en el panel admin llamada **"Configuración"** donde el admin pueda:
- Seleccionar el **Mes** del curso actual (dropdown con los 12 meses).
- Seleccionar el **Año** del curso actual (input numérico o dropdown).
- Botón "Guardar Configuración" que actualice la tabla `site_config`.

**Nueva ruta API** `app/api/admin/config/route.ts`:
- GET: devolver `course_month` y `course_year` desde `site_config` (usando `supabaseAdmin`).
- PUT: actualizar `course_month` y `course_year` en `site_config`.

### Cambio 4.6 — Persistencia: Solo Registros con Pago Exitoso
Actualmente el registro se crea como `pending` al iniciar el checkout. Esto es correcto y necesario para el flujo de Stripe.

**Ajuste:** En la vista de Matrículas del panel admin, **ocultar por defecto** los registros con `payment_status = 'pending'`. Mostrar solo los `paid`. Mantener el filtro existente para que el admin pueda ver los pendientes si lo desea, pero el filtro por defecto debe ser `paid`.

Cambiar:
```typescript
const [registrationFilter, setRegistrationFilter] = useState<'all' | 'paid' | 'pending'>('paid');
// Era 'all', ahora es 'paid' por defecto
```

---

## MÓDULO 5: MIGRACIONES SQL

Crear un nuevo archivo `supabase/migracion-v3.sql` con todos los cambios de base de datos:

```sql
-- ============================================================
-- MIGRACIÓN V3: Actualizaciones BPS v2.0
-- ============================================================

-- 1. Tabla de configuración del sitio
CREATE TABLE IF NOT EXISTS site_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  course_month TEXT NOT NULL DEFAULT 'Enero',
  course_year TEXT NOT NULL DEFAULT '2026',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO site_config (id, course_month, course_year)
VALUES ('default', 'Enero', '2026')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquier persona puede leer la configuración"
  ON site_config FOR SELECT USING (true);

CREATE POLICY "Solo servicio puede actualizar configuración"
  ON site_config FOR UPDATE USING (auth.role() = 'service_role');

-- 2. Nuevas columnas en registrations
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS last_name TEXT DEFAULT '';
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS postal_address TEXT DEFAULT '';
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS physical_address TEXT DEFAULT '';
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Puerto Rico';
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS id_document_path TEXT DEFAULT '';
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS tracking_number TEXT DEFAULT '';

-- 3. Migrar datos existentes (si hay registros previos)
-- Copiar address a postal_address para registros existentes
UPDATE registrations SET postal_address = address WHERE postal_address = '' AND address != '';
-- Copiar state a country
UPDATE registrations SET country = state WHERE country = 'Puerto Rico' AND state != '' AND state != 'Puerto Rico';
-- Copiar nickname a last_name
UPDATE registrations SET last_name = nickname WHERE last_name = '' AND nickname != '';

-- 4. (Opcional) Eliminar columnas obsoletas después de verificar la migración
-- NOTA: NO ejecutar hasta confirmar que todo funciona
-- ALTER TABLE registrations DROP COLUMN IF EXISTS address;
-- ALTER TABLE registrations DROP COLUMN IF EXISTS county;
-- ALTER TABLE registrations DROP COLUMN IF EXISTS state;
-- ALTER TABLE registrations DROP COLUMN IF EXISTS nickname;
```

---

## MÓDULO 6: SEGURIDAD Y VALIDACIONES

### 6.1 — Validación de Upload de Archivos
- Frontend: validar tipo MIME (`image/jpeg`, `image/png`, `application/pdf`) y tamaño (<= 5MB) antes de enviar.
- Backend/Storage: configurar política de Storage en Supabase para rechazar archivos > 5MB.
- Sanitizar el nombre del archivo (eliminar caracteres especiales).

### 6.2 — Ruta API para Lectura de Matrículas (Admin)
Crear `app/api/admin/registrations/route.ts`:
- Usar `supabaseAdmin` (service_role) para leer `registrations`.
- Aceptar query params opcionales: `?filter=paid&month=Enero&year=2026`.
- Devolver datos completos incluyendo URL firmada (signed URL) para el documento de ID si existe.
- NO exponer datos de matrículas por el cliente con la anon key.

### 6.3 — Protección Anti-Copia del Examen
Agregar en `app/globals.css` una clase para aplicar durante el examen:
```css
.exam-protegido {
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}
```
Aplicar esta clase al contenedor principal del examen en progreso.

### 6.4 — Validación de Acceso al Examen
- El endpoint `/api/exam/validate-access` debe verificar con `supabaseAdmin` (no anon key).
- Debe validar que el email corresponda a una matrícula pagada.
- Debe calcular correctamente la ventana de 24 horas desde `created_at` de la matrícula.
- Debe contar solo intentos de tipo 'oficial' del mismo email.

---

## CRITERIOS DE ACEPTACIÓN Y PRUEBAS

### Landing Page
- [ ] El texto de "Certificación Oficial" dice exactamente: "Al aprobar este curso recibes tu certificado digital oficial reconocido por el DRNA de Puerto Rico."
- [ ] El Footer solo muestra email como método de contacto (sin dirección ni teléfono).
- [ ] No se eliminó ninguna página existente.

### Matrícula
- [ ] El título del curso se genera automáticamente con el mes/año configurado en admin.
- [ ] La fecha de matrícula se llena automáticamente y es read-only.
- [ ] La fecha de firma de padre/tutor es automática y read-only.
- [ ] El campo "Apodo" fue reemplazado por "Apellido" (obligatorio).
- [ ] El campo "Condado" fue eliminado.
- [ ] "Estado" fue reemplazado por "País".
- [ ] Existen campos de Dirección Postal y Dirección Física con checkbox funcional.
- [ ] Se puede subir un archivo de ID (imagen o PDF, max 5MB) y se valida.
- [ ] El costo de shipping muestra $13.00 (no $10.00).
- [ ] El total con shipping es $93.00.
- [ ] Stripe cobra $93.00 cuando se incluye shipping.
- [ ] El formulario valida todos los campos obligatorios antes de enviar.

### Examen
- [ ] En smartphones (< 768px) se muestra mensaje de bloqueo y NO se puede acceder al examen.
- [ ] En tablets y desktop el examen funciona normalmente.
- [ ] El clic derecho está deshabilitado durante el examen.
- [ ] Ctrl+P / Cmd+P están bloqueados durante el examen.
- [ ] No se puede seleccionar texto durante el examen (CSS user-select: none).
- [ ] Con menos de 10 incorrectas, las respuestas incorrectas se aceptan normalmente.
- [ ] Con 10+ incorrectas, al seleccionar una incorrecta se muestra aviso y permite 1 reintento.
- [ ] Si reprueba, se muestran las preguntas falladas SIN la respuesta correcta.
- [ ] El temporizador de 3 horas se muestra y cuenta regresivamente.
- [ ] A los 10 minutos finales, el timer se pone rojo.
- [ ] Al expirar el tiempo, el examen se auto-evalúa.
- [ ] Se requiere email para iniciar el examen.
- [ ] Sin matrícula pagada → no puede tomar el examen.
- [ ] Después de 24 horas desde la matrícula → no puede tomar el examen.
- [ ] Después de 3 intentos → no puede tomar el examen.

### Panel Administrativo
- [ ] La tabla de matrículas muestra: Nombre, Apellido, Teléfono, Pueblo, Email, Estado Pago.
- [ ] El filtro por defecto es "Pagadas" (no "Todas").
- [ ] Existe filtro por Mes y Año de sección de curso.
- [ ] "Ver Detalles" muestra toda la info del formulario incluyendo archivo de ID.
- [ ] El campo de Tracking Number es editable y se guarda en Supabase.
- [ ] Tracking Number solo aparece si el estudiante solicitó envío de libro.
- [ ] Existe pestaña/sección de "Configuración" para editar Mes y Año del curso.
- [ ] Los datos de matrículas se cargan via ruta API con service_role (no anon key).

### Build y Calidad
- [ ] `npm run build` completa sin errores.
- [ ] No hay errores de linter.
- [ ] Todos los comentarios de código son en español.
- [ ] El diseño visual se mantiene consistente con el tema tropical.

---

## ORDEN DE EJECUCIÓN RECOMENDADO

1. **Migraciones SQL** → Ejecutar `migracion-v3.sql` en Supabase.
2. **Módulo 1** (Landing) → Cambios de texto y Footer.
3. **Módulo 2** (Matrícula) → Campos, upload, fechas, precios.
4. **Módulo 4** (Admin) → Rutas API, tabla, detalles, tracking, config.
5. **Módulo 3** (Examen) → Lógica, seguridad, timer, acceso.
6. **Módulo 6** (Seguridad) → Revisión final de validaciones.
7. **Build final** → `npm run build` sin errores.
