# GUIA COMPLETA DE DEPLOYMENT
## Como Publicar Tu Sitio Web en Internet

---

## OPCION RECOMENDADA: VERCEL (GRATIS)

Vercel es la mejor opcion para proyectos Next.js.

**Por que Vercel?**
- Gratis para proyectos personales
- Deploy en 5 minutos
- HTTPS/SSL automatico
- Dominio gratis: tu-sitio.vercel.app
- Actualizaciones automaticas cuando haces cambios

---

## PREPARACION ANTES DEL DEPLOYMENT

### 1. Configurar Supabase (Base de datos en produccion)

Tu base de datos de Supabase ya funciona en la nube, asi que esta lista para produccion.
Asegurate de tener tus claves:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 2. Configurar Stripe (Pagos en produccion)

**Para pruebas (modo test):**
- Usa las claves que empiezan con `sk_test_` y `pk_test_`
- Las tarjetas de prueba no cobran dinero real

**Para produccion (dinero real):**
1. En Stripe Dashboard, activa tu cuenta (verifica identidad)
2. Cambia a las claves "Live" (empiezan con `sk_live_`)
3. Configura el webhook con tu URL de produccion

### 3. Verificar que todo funciona localmente

```bash
cd /Users/ramonsuarez/Desktop/BPS/bps-website
npm run build
```

Si no hay errores, estas listo para deployment.

---

## PASO A PASO: DEPLOYMENT EN VERCEL

### PASO 1: Preparar Git (5 minutos)

Verifica si tienes Git:
```bash
git --version
```

Si no lo tienes, instalalo:
- **macOS:** `brew install git` o descarga de https://git-scm.com/

Inicializa Git en tu proyecto:
```bash
cd /Users/ramonsuarez/Desktop/BPS/bps-website

git init
git add .
git commit -m "BPS Certificacion Website v2.0 - Supabase + Stripe"
```

---

### PASO 2: Crear Repositorio en GitHub (5 minutos)

1. Ve a https://github.com y crea una cuenta (si no tienes)
2. Haz clic en "+" > "New repository"
3. Nombre: `bps-certification-website`
4. Visibilidad: Private (recomendado)
5. NO marques "Add a README file"
6. Haz clic en "Create repository"

Conecta tu proyecto local:
```bash
git remote add origin https://github.com/tu-usuario/bps-certification-website.git
git branch -M main
git push -u origin main
```

---

### PASO 3: Desplegar en Vercel (5 minutos)

1. Ve a https://vercel.com
2. Haz clic en "Sign Up" > "Continue with GitHub"
3. Haz clic en "Add New..." > "Project"
4. Busca `bps-certification-website` y haz clic en "Import"
5. Framework: Next.js (detectado automaticamente)

**IMPORTANTE - Agregar Variables de Entorno:**

En la seccion "Environment Variables", agrega TODAS estas:

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anon de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio de Supabase |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secreto del webhook de Stripe |
| `NEXT_PUBLIC_SITE_URL` | URL de tu sitio en Vercel (ej: https://bps-website.vercel.app) |

6. Haz clic en "Deploy"
7. Espera 1-2 minutos

Tu sitio estara en: `https://tu-proyecto.vercel.app`

---

### PASO 4: Configurar Webhook de Stripe en Produccion

1. Ve a https://dashboard.stripe.com/webhooks
2. Haz clic en "Add endpoint"
3. URL: `https://tu-proyecto.vercel.app/api/stripe/webhook`
4. Eventos a escuchar: `checkout.session.completed`
5. Haz clic en "Add endpoint"
6. Copia el "Signing secret" (empieza con `whsec_`)
7. Ve a Vercel > tu proyecto > Settings > Environment Variables
8. Actualiza `STRIPE_WEBHOOK_SECRET` con el nuevo valor
9. Redeploy el proyecto (Settings > Deployments > Redeploy)

---

## ACTUALIZAR TU SITIO

Cada vez que hagas cambios:

```bash
git add .
git commit -m "Descripcion de los cambios"
git push
```

Vercel actualiza automaticamente. No necesitas hacer nada mas.

---

## DOMINIO PERSONALIZADO

### Opcion 1: Usar el dominio gratuito de Vercel
Ya tienes: `tu-proyecto.vercel.app`

### Opcion 2: Usar tu propio dominio
1. En Vercel Dashboard > Settings > Domains
2. Agrega tu dominio (ej: boqueronpowersquadron.com)
3. Configura los DNS en tu proveedor de dominios segun las instrucciones de Vercel
4. Espera 24-48 horas para propagacion
5. **Actualiza** `NEXT_PUBLIC_SITE_URL` en las variables de entorno de Vercel con tu nuevo dominio
6. **Actualiza** la URL del webhook en Stripe Dashboard

---

## WEBHOOK DE STRIPE EN DESARROLLO LOCAL

Para probar pagos localmente, usa el CLI de Stripe:

```bash
# Instalar (macOS con Homebrew)
brew install stripe/stripe-cli/stripe

# Iniciar sesion en Stripe
stripe login

# Redirigir webhooks a tu servidor local
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

El CLI te dara un secreto temporal (empieza con `whsec_`). Ponlo en tu `.env.local`.

---

## CHECKLIST PRE-DEPLOYMENT

- [ ] El proyecto funciona localmente (`npm run dev`)
- [ ] Puedes hacer build sin errores (`npm run build`)
- [ ] El archivo `.env.local` tiene todas las variables configuradas
- [ ] La base de datos Supabase tiene las tablas creadas (schema.sql)
- [ ] Las preguntas estan cargadas en Supabase (seed-questions.sql)
- [ ] Stripe esta configurado con las claves correctas
- [ ] El `.gitignore` esta configurado (no subir .env.local)
- [ ] Has probado: matricula, pago, examen de practica, examen oficial, admin

---

## CHECKLIST POST-DEPLOYMENT

- [ ] El sitio carga correctamente en la URL de Vercel
- [ ] El formulario de matricula funciona
- [ ] El pago con Stripe funciona (usa tarjeta de prueba: 4242 4242 4242 4242)
- [ ] El webhook de Stripe actualiza el estado de la matricula
- [ ] El examen de practica funciona
- [ ] El examen oficial funciona (incluyendo la regla "Intenta De Nuevo")
- [ ] El panel admin muestra datos reales de Supabase
- [ ] El certificado digital se genera al aprobar

---

## TARJETAS DE PRUEBA DE STRIPE

Para probar pagos sin cobrar dinero real (en modo test):

| Tarjeta | Resultado |
|---------|-----------|
| `4242 4242 4242 4242` | Pago exitoso |
| `4000 0000 0000 0002` | Pago rechazado |
| `4000 0000 0000 3220` | Requiere autenticacion 3D Secure |

Usa cualquier fecha futura y cualquier CVC de 3 digitos.

---

## SOLUCION DE PROBLEMAS

### "Build Failed" en Vercel
- Verifica que `npm run build` funciona localmente
- Asegurate de que todas las variables de entorno estan en Vercel
- Revisa los logs del build en Vercel Dashboard

### Los pagos no funcionan en produccion
- Verifica que el webhook esta configurado con la URL correcta
- Verifica que `STRIPE_WEBHOOK_SECRET` tiene el valor correcto
- Revisa los logs del webhook en Stripe Dashboard > Webhooks

### El admin no muestra datos
- Verifica que las tablas estan creadas en Supabase
- Verifica que las claves de Supabase son correctas en las variables de entorno
- Revisa los logs de Vercel para errores

---

## OTRAS OPCIONES DE HOSTING

### Netlify (tambien gratis)
1. Ve a https://netlify.com
2. Sign up con GitHub
3. Importa tu repositorio
4. Agrega variables de entorno
5. Deploy automatico

### Railway (incluye base de datos)
1. Ve a https://railway.app
2. Sign up con GitHub
3. New Project > Deploy from GitHub
4. Incluye PostgreSQL gratis (alternativa a Supabase)

---

## RESUMEN RAPIDO

```bash
# 1. Preparar Git
cd /Users/ramonsuarez/Desktop/BPS/bps-website
git init && git add . && git commit -m "Initial commit"

# 2. Crear repo en GitHub (hazlo en github.com)

# 3. Conectar y subir
git remote add origin https://github.com/tu-usuario/tu-repo.git
git branch -M main
git push -u origin main

# 4. Deploy en Vercel (hazlo en vercel.com)
# - Importar repositorio
# - Agregar variables de entorno (Supabase + Stripe)
# - Deploy

# 5. Configurar webhook de Stripe con URL de produccion
```

---

*Guia creada para Americas Boating Club - Boqueron Power Squadron*
*Enero 2026*
