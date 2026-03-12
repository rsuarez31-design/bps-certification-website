# BIENVENIDO A TU SITIO WEB
## Americas Boating Club - Boqueron Power Squadron

---

## COMIENZA AQUI - Lee esto primero

Este es un sitio web completo y profesional para certificar navegantes bajo la Ley 430 de Puerto Rico. Incluye sistema de pagos con Stripe, base de datos con Supabase, examen de practica, examen oficial con reglas especiales, y panel administrativo completo.

---

## PASOS PARA EMPEZAR

### PASO 1: Tienes Node.js instalado?

Abre Terminal y escribe:
```bash
node --version
```

**Si ves un numero de version (ej: v20.11.0):**
Perfecto! Salta al PASO 2.

**Si ves "command not found":**
Necesitas instalar Node.js. Lee el archivo: `COMO_INSTALAR_NODEJS.md`

---

### PASO 2: Configurar servicios externos

Antes de ejecutar el proyecto, necesitas crear cuentas en dos servicios:

#### A) Supabase (Base de datos gratuita)
1. Ve a https://supabase.com y crea una cuenta gratuita
2. Crea un nuevo proyecto
3. Ve al "SQL Editor" y ejecuta el archivo `bps-website/supabase/schema.sql`
4. Luego ejecuta `bps-website/supabase/seed-questions.sql` (para cargar las 85 preguntas)
5. Ve a Settings > API y copia:
   - La URL del proyecto
   - La clave "anon public"
   - La clave "service_role" (secreta)

#### B) Stripe (Pagos con tarjeta)
1. Ve a https://stripe.com y crea una cuenta
2. En el Dashboard, ve a Developers > API Keys
3. Copia:
   - La clave secreta (empieza con `sk_test_`)
4. Configura un webhook (ve la Guia de Deployment para detalles)

#### C) Crear archivo de variables de entorno
1. Ve a la carpeta `bps-website/`
2. Copia el archivo `.env.local.example` y renombralo a `.env.local`
3. Abre `.env.local` y pega tus claves de Supabase y Stripe

---

### PASO 3: Ejecutar el Proyecto

1. **Abre Terminal:**
   - Presiona `Cmd + Espacio`
   - Escribe "Terminal"
   - Presiona Enter

2. **Copia y pega estos comandos UNO POR UNO:**

```bash
# Ir al directorio del proyecto
cd /Users/ramonsuarez/Desktop/BPS/bps-website

# Instalar dependencias (solo primera vez, tarda 2-3 minutos)
npm install

# Iniciar el servidor
npm run dev
```

3. **Abre tu navegador:**
   - Ve a: `http://localhost:3000`
   - Listo! Tu sitio esta corriendo

---

## ARCHIVOS IMPORTANTES PARA LEER

Lee estos archivos en este orden:

### 1. PRIMERO - Instrucciones Rapidas
Archivo: `bps-website/INSTRUCCIONES_RAPIDAS.md`
- Guia rapida para ejecutar el proyecto
- Solucion de problemas comunes

### 2. SEGUNDO - Resumen del Proyecto
Archivo: `RESUMEN_DEL_PROYECTO.md`
- Que incluye el proyecto completo
- Lista de todas las funcionalidades
- Estructura de archivos

### 3. TERCERO - Documentacion Completa
Archivo: `bps-website/README.md`
- Documentacion tecnica completa
- Guias de personalizacion

### 4. CUARTO - Guia de Deployment
Archivo: `GUIA_DE_DEPLOYMENT.md`
- Como publicar tu sitio en internet
- Como configurar Supabase y Stripe en produccion

### 5. OPCIONAL - Instalacion de Node.js
Archivo: `COMO_INSTALAR_NODEJS.md`
- Solo si no tienes Node.js instalado

---

## QUE PUEDES HACER CON ESTE SITIO?

### Para Estudiantes:
- Ver informacion del curso y la Ley 430
- Completar matricula digital con pago por Stripe ($80 + $10 opcional por libro)
- Tomar examen de practica (10 preguntas, gratis)
- Tomar examen oficial de certificacion (75 preguntas aleatorias)
- Recibir asistencia si tiene 7+ errores (regla "Intenta De Nuevo")
- Obtener certificado digital al aprobar (80% minimo)

### Para Administradores:
- Ver estadisticas reales desde Supabase (total inscritos, % aprobacion, ingresos)
- Ver lista de matriculas pagadas y pendientes con detalles expandibles
- Ver historial completo de examenes (practica y oficial)
- Ver las 10 preguntas mas falladas por los estudiantes

---

## MAPA DEL SITIO

Una vez que el sitio este corriendo, puedes visitar:

### Pagina Principal
`http://localhost:3000`
- Landing page con informacion de Ley 430
- Seccion "Que incluye nuestro curso" (Libro, Sistema de Ayuda, Licencia DRNA)
- Botones para inscribirse o hacer examen de practica

### Matricula
`http://localhost:3000/matricula`
- Formulario de inscripcion (informacion personal, fisica, embarcacion)
- Campos condicionales de firma si es menor de edad
- Seccion de pago con Stripe ($80 + $10 opcional por envio de libro)
- Los datos se guardan en Supabase

### Examen de Practica
`http://localhost:3000/practica`
- 10 preguntas (las primeras del banco)
- Se aprueba con 80% o mas (8 de 10 correctas)
- Revision de respuestas al terminar
- Gratis, sin pago necesario

### Examen Oficial
`http://localhost:3000/examen`
- 75 preguntas aleatorias de un banco de 85
- Regla "Intenta De Nuevo" (con 7+ errores, bloquea respuestas incorrectas)
- Si no aprueba: muestra revision de preguntas falladas con "Tu contestacion" vs "Respuesta correcta"
- Si aprueba: certificado digital con confeti

### Panel Admin
`http://localhost:3000/admin`
- Usuario: **BPS**
- Contrasena: **2026**
- Autenticacion verificada en el servidor (segura)
- 4 pestanas: Estadisticas, Matriculas, Examenes, Preguntas Falladas

---

## QUE INCLUYE EL PROYECTO?

### Archivos de Codigo: 30+ archivos

**5 Paginas:**
1. Landing Page (pagina principal)
2. Matricula Digital con Stripe
3. Examen de Practica (10 preguntas)
4. Examen Oficial (75 preguntas con reglas especiales)
5. Panel Administrativo (con datos de Supabase)

**5 Componentes Reutilizables:**
1. Navbar (barra de navegacion con links a Practica y Examen Oficial)
2. Footer (pie de pagina con enlaces y contacto)
3. ExamQuestion (muestra una pregunta con opciones)
4. ExamProgress (barra de progreso del examen)
5. ExamResults (resultados, certificado, revision)

**3 Rutas de API (servidor):**
1. `/api/stripe/checkout` - Crea sesion de pago en Stripe
2. `/api/stripe/webhook` - Recibe confirmacion de pago de Stripe
3. `/api/admin/verify` - Verifica credenciales del admin en el servidor

**2 Clientes de Base de Datos:**
1. `lib/supabase-client.ts` - Para el navegador (clave publica)
2. `lib/supabase-server.ts` - Para el servidor (clave privada)

**2 Archivos SQL:**
1. `supabase/schema.sql` - Crea las tablas en Supabase
2. `supabase/seed-questions.sql` - Carga las 85 preguntas del examen

**85 Preguntas del Examen:**
- Cada una con 4 opciones
- Respuesta correcta marcada
- Pista de ayuda incluida

---

## TECNOLOGIAS USADAS

- **Next.js 14** - Framework moderno de React
- **TypeScript** - JavaScript con tipos (menos errores)
- **Tailwind CSS** - Estilos modernos y responsivos
- **Lucide React** - Iconos bonitos
- **Canvas Confetti** - Animacion de confeti al aprobar
- **Supabase** - Base de datos en la nube (gratis)
- **Stripe** - Sistema de pagos con tarjeta (seguro)

---

## PERSONALIZACION RAPIDA

### Cambiar Colores:
Edita: `bps-website/tailwind.config.ts`

### Cambiar Textos de la Pagina Principal:
Edita: `bps-website/app/page.tsx`

### Agregar/Modificar Preguntas:
1. Edita `bps-website/data/examQuestions.ts` (para el codigo)
2. Actualiza la tabla `exam_questions` en Supabase (para la base de datos)

### Cambiar Logo:
Reemplaza: `bps-website/public/images/bps-logo.png`

### Cambiar Contacto:
Edita: `bps-website/components/Footer.tsx`

### Cambiar Precio del Curso:
Edita: `bps-website/app/api/stripe/checkout/route.ts` (busca `unit_amount`)
Edita: `bps-website/app/matricula/page.tsx` (busca los textos de precio)

---

## PROBLEMAS COMUNES

### Error: "npm: command not found"
Node.js no esta instalado. Lee: `COMO_INSTALAR_NODEJS.md`

### Error: "Port 3000 already in use"
Cierra otros servidores o usa otro puerto:
```bash
npm run dev -- --port 3001
```

### Error: "supabaseUrl is required"
No tienes el archivo `.env.local` configurado. Copia `.env.local.example` a `.env.local` y llena los valores.

### El sitio no se ve bien
Limpia la cache del navegador. Presiona `Cmd + Shift + R` para refrescar.

### Errores al ejecutar npm install
Verifica tu conexion a internet. Si persiste:
```bash
rm -rf node_modules
npm install
```

---

## INFORMACION DEL PROYECTO

**Proyecto:** Sistema de Certificacion de Navegacion
**Organizacion:** Americas Boating Club - Boqueron Power Squadron
**Ley:** Ley 430 de Puerto Rico
**Version:** 2.0.0
**Fecha:** Enero 2026

**Ubicacion del Proyecto:**
```
/Users/ramonsuarez/Desktop/BPS/bps-website
```

**Credenciales Admin:**
- Usuario: BPS
- Contrasena: 2026

**Servicios Externos Requeridos:**
- Supabase (base de datos) - https://supabase.com
- Stripe (pagos) - https://stripe.com

---

## PARA COMENZAR

```bash
cd /Users/ramonsuarez/Desktop/BPS/bps-website
npm install
npm run dev
```

Luego abre `http://localhost:3000` en tu navegador.

---

*Proyecto creado para Americas Boating Club - Boqueron Power Squadron*
*Enero 2026*
