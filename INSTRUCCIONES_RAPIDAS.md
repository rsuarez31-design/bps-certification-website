# INSTRUCCIONES RAPIDAS - BPS Website

---

## Primera vez? Sigue estos pasos

### PASO 1: Instalar Node.js (si no lo tienes)
1. Ve a https://nodejs.org/
2. Descarga la version LTS (la recomendada)
3. Abre el archivo descargado y sigue el instalador
4. Verifica en Terminal:
   ```bash
   node --version
   ```

---

### PASO 2: Configurar servicios externos

#### Supabase (base de datos)
1. Crea cuenta gratuita en https://supabase.com
2. Crea un proyecto nuevo
3. En "SQL Editor", ejecuta `supabase/schema.sql`
4. Luego ejecuta `supabase/seed-questions.sql`
5. Copia tus claves de Settings > API

#### Stripe (pagos)
1. Crea cuenta en https://stripe.com
2. Copia la clave secreta de Developers > API Keys

#### Archivo .env.local
1. Copia `.env.local.example` y renombralo a `.env.local`
2. Llena los valores con tus claves de Supabase y Stripe

---

### PASO 3: Ejecutar el Proyecto

1. **Abrir Terminal:**
   - Presiona `Cmd + Espacio`
   - Escribe "Terminal" y presiona Enter

2. **Ir al directorio del proyecto:**
   ```bash
   cd /Users/ramonsuarez/Desktop/BPS/bps-website
   ```

3. **Instalar dependencias (solo la primera vez):**
   ```bash
   npm install
   ```

4. **Iniciar el servidor:**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador:**
   - Ve a: `http://localhost:3000`

---

## Paginas Disponibles

| Pagina | URL | Descripcion |
|--------|-----|-------------|
| Inicio | `http://localhost:3000` | Pagina principal con info de Ley 430 |
| Matricula | `http://localhost:3000/matricula` | Formulario + pago Stripe |
| Practica | `http://localhost:3000/practica` | Examen de practica (10 preguntas) |
| Examen Oficial | `http://localhost:3000/examen` | Examen de 75 preguntas |
| Admin | `http://localhost:3000/admin` | Panel administrativo (BPS/2026) |

---

## Problemas Comunes

### "npm: command not found"
Node.js no esta instalado. Ve a https://nodejs.org/

### "supabaseUrl is required"
Falta `.env.local`. Copia `.env.local.example` a `.env.local` y llena los valores.

### "Port 3000 is already in use"
```bash
npm run dev -- --port 3001
```

### "Permission denied"
```bash
sudo npm install
```

---

## Detener el Servidor

En la Terminal donde esta corriendo, presiona:
```
Ctrl + C
```

---

## Archivos Importantes

| Archivo | Que hace |
|---------|----------|
| `app/page.tsx` | Pagina principal |
| `app/matricula/page.tsx` | Formulario de matricula + pago |
| `app/practica/page.tsx` | Examen de practica |
| `app/examen/page.tsx` | Examen oficial |
| `app/admin/page.tsx` | Panel administrativo |
| `data/examQuestions.ts` | Las 85 preguntas del examen |
| `.env.local` | Claves secretas (Supabase, Stripe) |
| `supabase/schema.sql` | Estructura de la base de datos |

---

## Webhook de Stripe (para desarrollo local)

Para que los pagos funcionen en desarrollo local, necesitas el CLI de Stripe:

```bash
# Instalar Stripe CLI (con Homebrew)
brew install stripe/stripe-cli/stripe

# Iniciar sesion
stripe login

# Redirigir webhooks a tu servidor local
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copia el secreto del webhook (empieza con `whsec_`) y ponlo en `.env.local`.

---

**Necesitas mas informacion?** Lee `README.md` para documentacion completa.
