# Americas Boating Club - Boqueron Power Squadron
## Sistema de Certificacion de Navegacion - Ley 430 PR

Sitio web completo para la certificacion oficial de navegantes bajo la Ley 430 de Puerto Rico.
Incluye base de datos Supabase, pagos con Stripe, examen de practica, examen oficial y panel administrativo.

---

## Caracteristicas Principales

- **Pagina Principal** - Diseno nautico moderno con informacion de la Ley 430
- **Matricula Digital** - Formulario completo con pago por Stripe ($80 + $10 opcional)
- **Examen de Practica** - 10 preguntas para prepararse, gratis
- **Examen Oficial** - 75 preguntas aleatorias con regla "Intenta De Nuevo" tras 7 errores
- **Certificado Digital** - Generacion automatica al aprobar con confeti animado
- **Panel Administrativo** - Estadisticas reales, matriculas pagadas/pendientes, historial de examenes

---

## Requisitos Previos

1. **Node.js** (version 18 o superior) - https://nodejs.org/
2. **npm** (viene incluido con Node.js)
3. **Cuenta de Supabase** (gratis) - https://supabase.com
4. **Cuenta de Stripe** (para pagos) - https://stripe.com

---

## Instalacion y Configuracion

### 1. Instalar dependencias
```bash
cd /Users/ramonsuarez/Desktop/BPS/bps-website
npm install
```

### 2. Configurar Supabase
1. Crea un proyecto en https://supabase.com
2. Ve al "SQL Editor" y ejecuta `supabase/schema.sql` (crea las tablas)
3. Ejecuta `supabase/seed-questions.sql` (carga las 85 preguntas)
4. Ve a Settings > API y copia las claves

### 3. Configurar Stripe
1. Crea una cuenta en https://stripe.com
2. Ve a Developers > API Keys y copia la clave secreta
3. Configura un webhook apuntando a `/api/stripe/webhook` con el evento `checkout.session.completed`

### 4. Crear archivo de variables de entorno
Copia `.env.local.example` a `.env.local` y llena los valores:
```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon
SUPABASE_SERVICE_ROLE_KEY=tu-clave-servicio
STRIPE_SECRET_KEY=sk_test_tu-clave
STRIPE_WEBHOOK_SECRET=whsec_tu-secreto
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Iniciar el servidor
```bash
npm run dev
```

Abre http://localhost:3000 en tu navegador.

---

## Estructura del Proyecto

```
bps-website/
├── app/                              # Paginas y rutas de API
│   ├── page.tsx                      # Pagina principal
│   ├── layout.tsx                    # Layout con Navbar y Footer
│   ├── globals.css                   # Estilos globales
│   ├── matricula/page.tsx            # Formulario + pago Stripe
│   ├── practica/page.tsx             # Examen de practica (10 preguntas)
│   ├── examen/page.tsx               # Examen oficial (75 preguntas)
│   ├── admin/page.tsx                # Panel administrativo
│   └── api/
│       ├── stripe/checkout/route.ts  # API: crear sesion de pago
│       ├── stripe/webhook/route.ts   # API: webhook de Stripe
│       └── admin/verify/route.ts     # API: verificar credenciales admin
├── components/                        # Componentes reutilizables
│   ├── Navbar.tsx                    # Barra de navegacion
│   ├── Footer.tsx                    # Pie de pagina
│   ├── ExamQuestion.tsx              # Pregunta del examen
│   ├── ExamProgress.tsx              # Barra de progreso
│   └── ExamResults.tsx               # Resultados y certificado
├── lib/                               # Clientes de servicios
│   ├── supabase-client.ts            # Supabase para el navegador
│   └── supabase-server.ts            # Supabase para el servidor
├── data/
│   └── examQuestions.ts              # 85 preguntas del examen
├── supabase/                          # Archivos SQL
│   ├── schema.sql                    # Esquema de tablas
│   └── seed-questions.sql            # Datos iniciales de preguntas
├── public/images/
│   └── bps-logo.png                  # Logo de BPS
├── .env.local.example                 # Ejemplo de variables de entorno
└── package.json                       # Dependencias
```

---

## Tecnologias Utilizadas

- **Next.js 14** - Framework de React con App Router
- **TypeScript 5** - JavaScript con tipos para codigo mas seguro
- **Tailwind CSS 3** - Framework de estilos responsivos
- **Lucide React** - Iconos modernos
- **Canvas Confetti** - Animacion de confeti al aprobar
- **Supabase** - Base de datos PostgreSQL en la nube
- **Stripe** - Procesamiento de pagos con tarjeta

---

## Credenciales del Panel Administrativo

- **URL:** `/admin`
- **Usuario:** BPS
- **Contrasena:** 2026

---

## Base de Datos (Supabase)

### Tablas

| Tabla | Descripcion |
|-------|-------------|
| `exam_questions` | 85 preguntas con opciones, respuesta correcta y pista |
| `registrations` | Matriculas con datos personales, pago y estado |
| `exam_attempts` | Intentos de examen (practica y oficial) |
| `exam_attempt_answers` | Respuesta individual de cada pregunta |

---

## Flujo de Pago (Stripe)

1. Estudiante completa formulario de matricula
2. Se guarda matricula en Supabase con estado "pendiente"
3. Se crea sesion de Stripe Checkout ($80 base + $10 opcional)
4. Estudiante paga en la pagina segura de Stripe
5. Stripe envia webhook confirmando el pago
6. Servidor actualiza la matricula a estado "pagada"
7. Estudiante regresa al sitio y ve confirmacion

---

## Reglas del Examen Oficial

- **75 preguntas** aleatorias de un banco de 85
- **80% para aprobar** (60 correctas minimo)
- **Regla "Intenta De Nuevo":** Con 7+ incorrectas, si selecciona una respuesta incorrecta:
  - No se acepta
  - Muestra "Intenta De Nuevo"
  - Acepta la siguiente opcion diferente (aunque sea incorrecta)
- **Si no aprueba:** Muestra revision detallada con "Tu contestacion" vs "Respuesta correcta"
- **Si aprueba:** Confeti + certificado digital descargable

---

## Personalizacion

| Que cambiar | Donde editarlo |
|-------------|----------------|
| Colores del tema | `tailwind.config.ts` |
| Textos de la pagina principal | `app/page.tsx` |
| Preguntas del examen | `data/examQuestions.ts` + tabla `exam_questions` en Supabase |
| Precio del curso | `app/api/stripe/checkout/route.ts` y `app/matricula/page.tsx` |
| Informacion de contacto | `components/Footer.tsx` |
| Logo | Reemplazar `public/images/bps-logo.png` |

---

## Solucion de Problemas

### "command not found: npm"
Node.js no esta instalado. Ve a https://nodejs.org/ e instala la version LTS.

### "supabaseUrl is required"
Falta el archivo `.env.local`. Copia `.env.local.example` a `.env.local` y llena los valores.

### "Port 3000 is already in use"
```bash
npm run dev -- --port 3001
```

### Errores al construir (npm run build)
```bash
rm -rf node_modules .next
npm install
npm run build
```

---

## Comandos

```bash
npm install        # Instalar dependencias
npm run dev        # Servidor de desarrollo
npm run build      # Construir para produccion
npm start          # Servidor de produccion
npm run lint       # Verificar calidad de codigo
```

---

## Licencia

(c) 2026 Americas Boating Club - Boqueron Power Squadron. Todos los derechos reservados.

---

*Proyecto creado para Americas Boating Club - Boqueron Power Squadron*
*Enero 2026 - Version 2.0*
