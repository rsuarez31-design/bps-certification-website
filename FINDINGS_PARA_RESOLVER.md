# Findings para Resolver

**Proyecto:** BPS — Americas Boating Club / Boquerón Power Squadron  
**Fecha del review:** 20 de abril de 2026  
**Tipo de revisión:** Auditoría de seguridad y calidad (10 agentes paralelos, solo lectura)  
**Alcance:** `/Users/ramonsuarez/Desktop/BPS/bps-website/` (Next.js 14 App Router), esquema Supabase, workflows de CI/CD, documentación del repo.

> **Nota de actualización (2026-04-23):** La carpeta anidada `bps-website/` fue consolidada con la raíz del repo. A partir de esta fecha, las rutas que aparecen en este documento como `bps-website/X` deben leerse simplemente como `X` desde la raíz del proyecto (`/Users/ramonsuarez/Desktop/BPS/`). El finding **H-9 (Repos Git anidados con el mismo remoto)** quedó resuelto en los commits `8fa9fa7` (elimina submódulo huérfano), `d337bf3` (fix footer) y `011e495` (docs sincronizados).

---

## Índice

1. [Resumen ejecutivo](#1-resumen-ejecutivo)
2. [Conteo consolidado por severidad](#2-conteo-consolidado-por-severidad)
3. [Findings críticos (C-1 a C-5)](#3-findings-criticos)
4. [Findings altos (H-1 a H-9)](#4-findings-altos)
5. [Findings medios y bajos agrupados](#5-findings-medios-y-bajos-agrupados-por-tema)
6. [Plan de remediación priorizado](#6-plan-de-remediacion-priorizado)
7. [Observaciones positivas](#7-observaciones-positivas-consolidadas)
8. [Mensaje ejecutivo (resumen para dirección)](#8-mensaje-ejecutivo-resumen-para-direccion)

---

## 1. Resumen ejecutivo

**Nivel de riesgo global: Alto.**

El sitio funciona, pero la **seguridad descansa casi enteramente en la UI del cliente** mientras que **las rutas de servidor y las políticas de Supabase no la refuerzan**. Un atacante con conocimiento básico de DevTools o `curl` puede:

1. Leer y modificar datos del panel administrativo (PII de matrículas pagadas, configuración del curso, tracking) **sin autenticarse**.
2. Obtener las **respuestas correctas del examen oficial** desde el bundle del cliente o desde Supabase con la clave anon.
3. Registrar un examen como "aprobado" aunque no lo sea, porque el cálculo de `passed`/`percentage` ocurre en el navegador y se escribe directamente con la clave anon.
4. Acceder al examen oficial demostrando **solo** el email de un alumno pagado (sin autenticación real del dueño de ese email).
5. Usar credenciales por defecto `BPS / 2026` si en algún entorno faltan variables de entorno.

El flujo de pago con Stripe está **bien verificado en el webhook** (firma + raw body) y los precios son fijos en servidor, pero hay huecos secundarios (UX que declara "pagado" sin verificar, ausencia de handlers de `refund`/`dispute`, IDOR menor en creación de Checkout).

---

## 2. Conteo consolidado por severidad

Tras deduplicar hallazgos que varios agentes reportaron en común:


| Severidad       | # findings únicos |
| --------------- | ----------------- |
| Critical        | 5                 |
| High            | 9                 |
| Medium          | 14                |
| Low             | 16                |
| Info / Positivo | 12+               |


---

## 3. Findings críticos

### C-1 · Crítica · Rutas `/api/admin/`* no autentican al llamante (excepto `/verify`)

- **Referencias cruzadas:** A1-02, A3-01, A6-01, A8-03
- **Ubicación:**
  - `bps-website/app/api/admin/registrations/route.ts` (GET, ~15-61)
  - `bps-website/app/api/admin/config/route.ts` (GET/PUT, ~12-58)
  - `bps-website/app/api/admin/tracking/route.ts` (PUT, ~11-29)

**Problema:** El login `POST /api/admin/verify` solo devuelve `{ authenticated: true }` y el cliente guarda el estado en React. Las rutas posteriores usan `supabaseAdmin` (service_role, bypass RLS) **sin** cookie, JWT ni header firmado. Un `curl` anónimo desde Internet puede leer todas las matrículas pagadas con PII completa, generar signed URLs de documentos de identidad, cambiar `course_month`/`course_year`, o escribir `tracking_number` arbitrarios.

**Impacto:** Exposición masiva de datos personales (nombre, email, teléfono, dirección, documento de identidad), alteración silenciosa de configuración del curso, corrupción de números de seguimiento.

**Remediación sugerida (sin introducir regresiones):**

1. Emitir sesión servidor tras `POST /api/admin/verify`: cookie **HttpOnly + Secure + SameSite=Lax**, firmada con secreto propio (p. ej. JWT HS256 con `jose`) con TTL corto (30-60 min) y sliding expiration.
2. Crear helper `requireAdmin(request)` que lea la cookie, valide la firma y el TTL, y devuelva `401` si falla.
3. Aplicar `requireAdmin` como primera línea en cada handler de `/api/admin/`* antes de tocar `supabaseAdmin`.
4. (Opcional, capa extra) Añadir `middleware.ts` que rechace cualquier `/api/admin/`* sin cookie válida.
5. El `page.tsx` del admin no cambia: la cookie viaja automáticamente en los `fetch` del mismo origen.

---

### C-2 · Crítica · Credenciales admin por defecto en código y documentadas

- **Referencias cruzadas:** A1-01, A5-02, A5-03, A8-18, A10-02
- **Ubicación:**
  - `bps-website/app/api/admin/verify/route.ts:17-19`
  - `bps-website/.env.local.example:22-24`
  - Documentación pública: `README.md`, `COMIENZA_AQUI.md`, `INSTRUCCIONES_RAPIDAS.md`, `RESUMEN_DEL_PROYECTO.md`

**Problema:** Si faltan `ADMIN_USERNAME`/`ADMIN_PASSWORD`, el servidor usa `'BPS'` y `'2026'` como fallback. Los mismos valores aparecen como ejemplo en `.env.local.example` y en guías `.md` visibles. Quien clone o lea el repo obtiene credenciales operativas si el despliegue está mal configurado.

**Impacto:** Compromiso total del panel admin en cualquier entorno donde falten las env vars. La comparación de contraseña además usa `===` (no `timingSafeEqual`), lo que teoriza enumeración por canal lateral.

**Remediación:**

1. En `verify/route.ts`, cambiar a `if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) return 503` y eliminar los fallbacks.
2. En `.env.local.example`, usar placeholders claramente falsos (`your_admin_username`, `set-a-strong-password`).
3. Borrar las credenciales reales de todas las guías `.md`; sustituir por "configurado en variables de entorno".
4. Usar `crypto.timingSafeEqual` sobre buffers de longitud fija para la comparación de contraseña.
5. Rotar credenciales reales si alguna vez se desplegó con estos valores.

---

### C-3 · Crítica · Respuestas correctas del examen expuestas al cliente

- **Referencias cruzadas:** A3-03, A7-01, A8-01, A8-02
- **Ubicación:**
  - `bps-website/data/examQuestions.ts` (campo `correctAnswer`)
  - `bps-website/lib/questions-loader.ts:35-37` (`select('*')`)
  - `bps-website/supabase/schema.sql:124-126` (política `SELECT USING (true)` sobre `exam_questions`)

**Problema:** `correctAnswer`/`correct_index` viaja al navegador (tanto en el banco fallback del bundle como en la respuesta Supabase anon). Cualquiera ve las respuestas con DevTools → pestaña Network/Sources antes de contestar.

**Impacto:** El examen oficial **no puede considerarse confidencial**. Compromete la certificación legal del curso.

**Remediación:**

1. Crear **vista SQL** `exam_questions_public` que exponga solo `id, question, option_a..d, hint` y otorgar SELECT a `anon` **únicamente** sobre la vista; revocar SELECT de `anon` sobre la tabla base.
2. Cambiar `questions-loader.ts` para consultar la vista y nunca `select('*')` contra `exam_questions`.
3. Eliminar `correctAnswer` del objeto `ExamQuestion` del cliente; mover la calificación al servidor (ver C-4).
4. Eliminar del bundle `data/examQuestions.ts` como fuente con respuestas, o convertirlo en un mock de solo dev (gated por `process.env.NODE_ENV`).

---

### C-4 · Crítica · Resultado del examen oficial calculado y escrito en el cliente

- **Referencias cruzadas:** A3-02, A7-02, A8-14
- **Ubicación:**
  - `bps-website/app/examen/page.tsx:272-345` (`finishExam`)
  - `bps-website/supabase/schema.sql:144-155` (RLS permisiva en `exam_attempts` / `exam_attempt_answers`)

**Problema:** El navegador calcula `correct`, `incorrect`, `percentage`, `passed` y los inserta con el cliente anon. Un usuario malicioso puede POSTear directamente `{ passed: true, percentage: 100 }` a la tabla, porque la política es `INSERT WITH CHECK (true)`. El "certificado" generado es derivado de ese estado no verificado.

**Impacto:** Fraude completo de aprobación del examen. Certificados emitidos sin base real.

**Remediación:**

1. Crear `POST /api/exam/submit` (server-side) que reciba `attemptToken` + `{ [questionId]: selectedIndex }`.
2. En servidor: recalcular contra `correct_index` en DB, aplicar reglas de retry/tiempo, y **solo el servidor** inserta en `exam_attempts` con `supabaseAdmin`.
3. Restringir RLS de `exam_attempts`/`exam_attempt_answers` a `service_role` para INSERT/SELECT.
4. Certificado emitido solo por esta ruta, con un `certificate_id` firmado o guardado en DB.

---

### C-5 · Crítica · Ventana de 24h calculada desde `created_at` (creación del borrador), no desde el pago

- **Referencias cruzadas:** A10-01
- **Ubicación:** `bps-website/app/api/exam/validate-access/route.ts:40-50`

**Problema:** La fila `registrations` se crea antes de pagar con `payment_status: 'pending'`. Si el usuario paga horas o días después (enlaces guardados, reintentos), las 24h ya están gastadas y el examen figura "expirado" antes de poder comenzarse. Contradice la regla de negocio documentada.

**Impacto:** Alumnos pagados pueden quedarse sin acceso al examen. Impacto directo al negocio y a soporte.

**Remediación:**

1. Añadir columna `paid_at timestamptz` en `registrations`.
2. Actualizar `paid_at = now()` en `/api/stripe/webhook` (evento `checkout.session.completed`) y en `/api/stripe/confirm-session`.
3. En `validate-access`, calcular `horasTranscurridas = (now - paid_at) / 3600000`.
4. Migración SQL idempotente: `ALTER TABLE registrations ADD COLUMN IF NOT EXISTS paid_at timestamptz`.

---

## 4. Findings altos

### H-1 · Alta · RLS abierta en `exam_attempts` y `exam_attempt_answers`

- **Referencias:** A1-06, A3-02, A7-03
- **Ubicación:** `bps-website/supabase/schema.sql:144-155`

**Problema:** `SELECT USING (true)` + `INSERT WITH CHECK (true)` para anon. Expone nombres, emails, `registration_id` y resultados completos de todos los estudiantes; permite falsificación de intentos y spam.

**Remediación:** Restringir a `service_role` y mover todas las lecturas/escrituras a API server (ver C-4). Si se requiere insertar desde el cliente durante la transición, condicionar por un token emitido en servidor.

---

### H-2 · Alta · `validate-access` permite enumeración de estado y carrera entre pestañas

- **Referencias:** A2-01, A2-02, A7-04, A7-05, A7-06
- **Ubicación:** `bps-website/app/api/exam/validate-access/route.ts`

**Problema:**

- Respuestas diferentes según estado (no pagado / 24h vencidas / 3 intentos / OK) permiten enumerar emails pagados.
- No reserva intento: cada llamada no cuenta, solo `finishExam`. Varios tabs en paralelo pueden pasar el chequeo `count === 2` y luego superar 3 intentos.
- Sin rate limiting.
- `countError` no se maneja: si Supabase falla, el código usa `count || 0` y **concede acceso**.

**Remediación:**

1. Crear sesión de examen atómica: tabla `exam_sessions` con `UNIQUE(student_email, window_start)` o reserva vía RPC `SECURITY DEFINER` que haga el conteo+insert en una sola transacción.
2. Devolver siempre el mismo mensaje genérico ("acceso denegado") y registrar la razón detallada solo en logs del servidor.
3. Si `countError`, denegar acceso.
4. Añadir rate limit por IP+email (Upstash Redis o Vercel KV).

---

### H-3 · Alta · Upload de ID validado solo en cliente

- **Referencias:** A6-02
- **Ubicación:**
  - `bps-website/app/matricula/page.tsx:64-67, 191-207, 305-311`
  - Bucket `id-documents` (políticas no versionadas en SQL)

**Problema:** `file.type` y tamaño se validan solo en el navegador. La subida usa `supabase.storage.upload(...)` con anon. No se verifica magic bytes, ni se limita MIME en servidor, ni hay política RLS versionada para el bucket.

**Remediación:**

1. Subir vía `POST /api/registrations/upload-id` server-side que valide en binario (`file-type` npm), tamaño duro, extensión lista-blanca (`jpg|jpeg|png|pdf`), y suba con `supabaseAdmin`.
2. Versionar en SQL las políticas del bucket `id-documents`: `INSERT` solo con `service_role`, `SELECT` solo `service_role` (signed URLs para admin).
3. Verificar en el dashboard de Supabase que el bucket es privado.
4. Acortar TTL de signed URLs (5-15 min en vez de 3600).

---

### H-4 · Alta · `UPDATE registrations.id_document_path` desde el cliente contradice RLS del esquema

- **Referencias:** A3-05
- **Ubicación:**
  - `bps-website/app/matricula/page.tsx:309-317`
  - `bps-website/supabase/schema.sql:140-142`

**Problema:** El esquema declara que solo `service_role` puede `UPDATE registrations`, pero el código cliente ejecuta ese `UPDATE` con anon. O la política real en producción fue relajada (vector de escalada), o el update falla silenciosamente y los documentos quedan "huérfanos" en Storage sin referencia en DB.

**Remediación:** Mover el update a la misma API de upload (H-3) con `supabaseAdmin`. El cliente solo llama a la API; la API sube + actualiza `id_document_path` en una sola transacción.

---

### H-5 · Alta · Pantallas de "pagado" sin verificar realmente el pago

- **Referencias:** A4-01, A4-02
- **Ubicación:**
  - `bps-website/app/matricula/page.tsx:86-88, 156-159`: `?success=true` marca `isSubmitted` sin validar.
  - `bps-website/app/pago-exitoso/page.tsx:76-82`: muestra "¡Pago Exitoso!" aunque no haya `session_id`.

**Problema:** Cualquiera puede visitar `/matricula?success=true` o `/pago-exitoso` sin query y ver confirmación visual engañosa. No es fraude financiero (Stripe decide el pago real), pero rompe la confianza y puede confundir a soporte.

**Remediación:**

1. En `/pago-exitoso`, cambiar el título a "Verificando tu pago…" hasta que `confirm-session` responda `success: true`. Si no hay `session_id` o falla, mostrar error.
2. Eliminar `?success=true` en `/matricula` o exigir que venga junto con un `session_id` válido que se confirme por API.

---

### H-6 · Alta · Webhook Stripe no valida `session.payment_status` antes de marcar `paid`

- **Referencias:** A4-05
- **Ubicación:** `bps-website/app/api/stripe/webhook/route.ts:55-76`

**Problema:** En `checkout.session.completed`, el código marca la fila como `paid` usando solo `metadata.registrationId`. En casos atípicos (pagos asincrónicos, pending_payment) podría activarse sin pago real.

**Remediación:** Condicionar el UPDATE a `session.payment_status === 'paid'` **y** validar `amount_total` contra el importe esperado (8000 o 9300 según `wants_book_shipping` de la fila).

---

### H-7 · Alta · No hay handlers para `refund`, `dispute`, `charge.failed`

- **Referencias:** A4-06
- **Ubicación:** `bps-website/app/api/stripe/webhook/route.ts`

**Problema:** Si el pago se reembolsa o se disputa, la fila sigue como `paid`. El alumno podría acceder al examen aunque Stripe ya devolvió el dinero.

**Remediación:**

1. Ampliar `payment_status` con `refunded`, `disputed`.
2. Manejar `charge.refunded`, `charge.dispute.created`, `charge.dispute.closed`, `payment_intent.payment_failed`.
3. En cada uno, actualizar `payment_status` correspondientemente y revisar acceso a examen.

---

### H-8 · Alta · Enlace público `/admin` en el footer

- **Referencias:** A8-04
- **Ubicación:** `bps-website/components/Footer.tsx:56-63`

**Problema:** Facilita que un atacante casual encuentre el panel y pruebe fuerza bruta contra `/api/admin/verify`. Combinado con C-2 y A1-05, eleva el riesgo.

**Remediación:** Quitar el enlace de `/admin` del footer; el admin accede vía bookmark o URL directa. Añadir `robots.txt` y/o `X-Robots-Tag: noindex` al layout admin (ya está parcialmente).

---

### H-9 · Alta · Repos Git anidados con el mismo remoto

- **Referencias:** A9-01
- **Ubicación:** `/BPS/.git/` y `/BPS/bps-website/.git/` apuntan ambos a `github.com/rsuarez31-design/bps-certification-website.git`. Código duplicado en las dos raíces.

**Problema:** Dos árboles paralelos con el mismo `origin` hacen trivial pushear desde la raíz equivocada, creando historias divergentes y despliegues sobre código obsoleto. Además `keep-supabase-alive.yml` y `package-lock.json` están duplicados.

**Remediación:**

1. Decidir una sola fuente de verdad (recomendado: `bps-website/` como root del repo en GitHub, o convertir el repo padre en monorepo con un solo `.git`).
2. Eliminar la carpeta duplicada.
3. Consolidar los workflows de GitHub Actions en un único lugar alineado con la raíz real en el remoto.

---

## 5. Findings medios y bajos agrupados por tema

### A. Seguridad del flujo Stripe


| ID                            | Severidad | Resumen                                                                                                                            |
| ----------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| A4-04 / A6-07                 | Media     | IDOR ligero en `/api/stripe/checkout`: acepta cualquier `registrationId`; no exige `payment_status === 'pending'`, no valida UUID. |
| A4-07                         | Baja      | `confirm-session` no valida `amount_total`.                                                                                        |
| A6-04                         | Media     | `wantsBookShipping` tratado como truthy genérico (`"false"` string ⇒ añade $13).                                                   |
| A4-08                         | Baja      | Comprobaciones de placeholders de `STRIPE_SECRET_KEY` inconsistentes entre rutas.                                                  |
| A4-09 / A2-05 / A2-10 / A8-19 | Baja      | Rutas devuelven `err.message` / `error.message` directo al cliente.                                                                |
| A4-10 / A2-08 / A3-08         | Media     | `abandon-pending` sin firma: quien conozca el UUID puede borrar borradores `pending` ajenos.                                       |
| A6-13                         | Baja      | `window.location.href = stripeData.url` sin whitelist de `checkout.stripe.com`.                                                    |
| A4-11                         | Info      | `confirm-session` acepta `cs_...` arbitrario (mitigado: el metadata lo fija el servidor).                                          |


**Remediación general:**

- Validar UUID en checkout y `payment_status === 'pending'` antes de crear sesión.
- Convertir `wantsBookShipping` a boolean estricto: `wantsBookShipping === true`. Mejor: leer el flag de la fila en DB ignorando el body.
- Unificar comprobación de secrets Stripe en un helper `ensureStripeConfigured()`.
- Normalizar manejo de errores: `log(err)` en server + mensaje genérico al cliente.
- Firmar `registration_id` en `cancel_url` con HMAC + expiración corta.
- Añadir whitelist explícita de dominio para la URL de redirección al checkout.

---

### B. Validación e inputs


| ID            | Severidad | Resumen                                                                                                          |
| ------------- | --------- | ---------------------------------------------------------------------------------------------------------------- |
| A6-03 / A6-15 | Media     | Inserts en `registrations` y `exam_attempts` desde cliente sin validación servidor, sin límites de longitud.     |
| A6-05         | Media     | `validate-access` sin regex ni `maxLength` para email.                                                           |
| A6-14         | Baja      | Email no se normaliza (`trim().toLowerCase()`) al insertar matrícula, sí al consultar en examen → desalineación. |
| A6-06         | Media     | `.ilike('course_name', '%${month}%')` — metacaracteres SQL (`%`, `_`) en el body amplían resultados.             |
| A6-12         | Baja      | `course_name` se compone en cliente con `site_config`; vía C-1 un atacante podría cambiarlo.                     |


**Remediación:**

- Validar con `zod` o similar en server (email ≤ 254 chars, teléfono regex PR, longitudes de dirección).
- Añadir `CHECK (length(...) <= ...)` en DB o usar `varchar(n)`.
- Escapar `%` y `_` antes de `ilike`, o validar `month`/`year` contra lista-blanca.
- Normalizar email con `.trim().toLowerCase()` en un único helper server-side.

---

### C. Supabase, RLS y schema


| ID    | Severidad | Resumen                                                                                           |
| ----- | --------- | ------------------------------------------------------------------------------------------------- |
| A3-04 | Media     | `registrations` INSERT abierto — riesgo de spam de matrículas.                                    |
| A3-07 | Baja      | Inconsistencia `paid` vs `Paid` entre rutas.                                                      |
| A3-11 | Baja      | Faltan CHECK/ENUMs en varios campos libres.                                                       |
| A3-12 | Baja      | Índice compuesto recomendado `(student_email, exam_type, created_at)` en `exam_attempts`.         |
| A3-14 | Media     | `seed-questions.sql` hace `DELETE FROM exam_questions` — destructivo si se ejecuta en producción. |
| A3-16 | Baja      | `stripe_session_id` (TypeScript) vs `stripe_checkout_session_id` (columna real) desalineados.     |


**Remediación:**

- Añadir rate limit + CAPTCHA a matrícula pública o mover insert a API.
- Forzar `payment_status` con trigger `LOWER()` + CHECK ajustado.
- Convertir el seed en idempotente (`INSERT ... ON CONFLICT DO NOTHING`) o moverlo a carpeta `dev/`.
- Alinear nombres de campos en interfaces TypeScript.

---

### D. Sistema de examen


| ID            | Severidad | Resumen                                                                                                          |
| ------------- | --------- | ---------------------------------------------------------------------------------------------------------------- |
| A7-08         | Media     | Las preguntas están accesibles sin pasar por `validate-access` vía API de Supabase directa.                      |
| A7-09         | Baja      | Anti-cheat (contextmenu, Ctrl+P, PrintScreen, user-select) trivialmente eludible — tratar como UX, no seguridad. |
| A7-10         | Baja      | Device restriction `innerWidth < 768` trivial de bypassear.                                                      |
| A7-11 / A7-12 | Baja      | Reglas de retry y timer de 3h solo en cliente; al recargar se pierde progreso.                                   |
| A7-13         | Baja      | Fisher-Yates en cliente con `Math.random()`.                                                                     |
| A7-14         | Info      | Práctica anónima sin rate limit puede inflar tabla.                                                              |


**Remediación:** El punto estratégico es mover la máquina de estado del examen al servidor (C-4 y H-2). Una vez el servidor decide preguntas, tiempo y progreso, todo lo anterior se cierra.

---

### E. Cliente / UI / estado


| ID              | Severidad | Resumen                                                                                                                                |
| --------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| A8-07           | Media     | `isMobile` inicia en `false`; flash de UI antes de bloquear.                                                                           |
| A8-09 / A10-05  | Media     | Doble submit posible en `finishExam` (oficial y práctica) y en login admin.                                                            |
| A10-03 / A10-04 | Alta      | `fetch` sin `res.ok` en `validate-access`, `saveTracking`, `loadConfig`. `saveTracking` actualiza UI optimista sin confirmar servidor. |
| A10-06          | Media     | Inserts del examen no manejan `error` de Supabase.                                                                                     |
| A10-07          | Media     | `sessionStorage` para abandono se marca antes del `fetch`.                                                                             |
| A10-09          | Media     | `useEffect` con `finishExam(true)` suprime `exhaustive-deps`.                                                                          |
| A10-11 / A10-12 | Baja      | `requestAnimationFrame` en `Counter` y confetti sin `cancelAnimationFrame`.                                                            |
| A10-14          | Baja      | `clearInterval(timerRef.current!)` con `!` non-null assertion.                                                                         |


**Remediación:**

- `useRef<boolean>` isSubmitting para bloquear doble-submit en `finishExam`.
- Helper `apiFetch<T>()` que chequee `res.ok` y lance con mensaje tipado.
- Desestructurar `{ data, error }` en todos los inserts Supabase.
- Marcar `sessionStorage` solo tras `res.ok`.
- `cancelAnimationFrame` en cleanups.

---

### F. Secrets, config, CI/CD


| ID            | Severidad | Resumen                                                                                                                            |
| ------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| A5-01         | Media     | `.gitignore` solo cubre `.env*.local`; no `.env`, `.env.production`.                                                               |
| A5-04 / A1-08 | Media     | `supabase-server.ts` crea cliente placeholder si faltan env vars en vez de fallar.                                                 |
| A5-05         | Baja      | `NEXT_PUBLIC_SITE_URL                                                                                                              |
| A9-02 / A6-11 | Media     | `next.config.js` sin `headers()` — falta CSP, HSTS, X-Frame-Options, Referrer-Policy, X-Content-Type-Options.                      |
| A9-03         | Baja      | TypeScript: falta `noUncheckedIndexedAccess`.                                                                                      |
| A9-04         | Baja      | Workflow `keep-supabase-alive.yml`: sin `permissions: {}`; cron `0 8 */5 *` * significa días 1, 6, 11… no "cada 5 días naturales". |
| A9-05         | Media     | Rangos `^` sin ejecutar `npm audit` ni Dependabot.                                                                                 |
| A9-07         | Baja      | Regla Cursor hace `git add -A` masivo.                                                                                             |
| A9-08         | Baja      | Dos `package-lock.json` duplicados.                                                                                                |
| A1-05         | Media     | Rate limiting en memoria del proceso en `verify` — no sirve en Vercel serverless.                                                  |


**Remediación:**

- Extender `.gitignore` a `.env`, `.env.*`, excepción `!.env*.example`.
- Eliminar cliente placeholder en `supabase-server.ts`; lanzar error.
- Exigir `NEXT_PUBLIC_SITE_URL` en producción.
- Añadir `async headers()` con CSP básica, `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
- Añadir `permissions: {}` al workflow; corregir cron a `0 */12 * * *` o similar.
- Activar Dependabot + `npm audit` en CI.
- Sustituir el rate-limiter en memoria por Upstash Redis o Vercel KV.

---

### G. Accesibilidad y código


| ID     | Severidad | Resumen                                                     |
| ------ | --------- | ----------------------------------------------------------- |
| A10-15 | Baja      | Modal admin sin `role="dialog"`, captura de foco ni Escape. |
| A10-16 | Baja      | Labels sin `htmlFor` / inputs sin `id` asociados.           |
| A10-17 | Baja      | Botones de respuesta sin `aria-pressed` / `role="radio"`.   |
| A10-13 | Baja      | Uso de `any` y `as any` en varias rutas.                    |
| A10-18 | Info      | `console.log` en webhook con `registrationId`.              |
| A10-20 | Info      | Duplicación de lógica entre examen oficial y práctica.      |


---

## 6. Plan de remediación priorizado

Este orden minimiza riesgo y evita introducir regresiones (los cambios tempranos no dependen de posteriores).

### Fase 0 — Parches inmediatos (~1 día, bajo riesgo de romper nada)

1. **C-2**: eliminar fallbacks `BPS`/`2026`, depurar guías `.md`, rotar credenciales.
2. **H-8**: quitar enlace `/admin` del footer.
3. Normalizar errores: dejar de devolver `err.message` al cliente (A2-05, A4-09, A8-19).
4. Corregir cron del workflow (A9-04).
5. Extender `.gitignore` (A5-01).
6. **C-5**: añadir columna `paid_at` + actualizarla en webhook y `confirm-session`; `validate-access` pasa a usar `paid_at`.

### Fase 1 — Autenticación admin real (~2-3 días)

1. **C-1**: cookie HttpOnly + helper `requireAdmin` + aplicar en las tres rutas `/api/admin/*`.
2. **A1-05**: mover rate-limit de verify a Upstash/KV.
3. **H-6**: exigir `session.payment_status === 'paid'` en webhook.

### Fase 2 — Integridad del examen (~3-5 días)

1. **C-3**: vista `exam_questions_public` + retirar `correctAnswer` del bundle.
2. **C-4**: `POST /api/exam/submit` server-side que recalcula y persiste.
3. **H-1**: RLS estricta para `exam_attempts`/`exam_attempt_answers`.
4. **H-2**: reserva atómica de sesión de examen + rate limit.

### Fase 3 — Endurecer pagos y uploads (~2 días)

1. **H-3 + H-4**: ruta `POST /api/registrations/upload-id` con validación binaria y `supabaseAdmin`.
2. **H-5**: UX de `/pago-exitoso` "verificando…" y remover `?success=true` en `/matricula`.
3. **H-7**: handlers de `refund`, `dispute`, `payment_failed`.
4. **A6-04, A4-04, A6-07**: hardening del checkout.

### Fase 4 — Limpieza estructural (~1-2 días)

1. **H-9**: unificar los dos repos Git con el mismo remoto.
2. **A9-02**: security headers en `next.config.js`.
3. Helper `apiFetch<T>()` + aplicar en cliente (A10-03, A10-04).

### Fase 5 — Mejoras de calidad (continuo)

1. Accesibilidad del modal admin (A10-15-17).
2. Eliminar `any`, mejorar tipos (A10-13).
3. Dependabot + `npm audit` en CI.
4. Normalizar emails en un único helper.

---

## 7. Observaciones positivas consolidadas

- **Verificación de firma del webhook Stripe** con `request.text()` + `constructEvent` antes de cualquier mutación (A4-12).
- **Precios fijos en servidor** en el checkout (`unit_amount: 8000 / 1300`); el cliente no puede alterar el importe cobrado (A4-14).
- **No se toca PCI**: Stripe Checkout hospeda el ingreso de tarjeta (A4-15).
- `**stripe_checkout_session_id` y `stripe_payment_intent_id`** se persisten para auditoría (A4-17).
- `**robots: { index: false, follow: false }**` en el layout del admin.
- `**useSearchParams` envuelto en `<Suspense>**` en `/matricula` y `/pago-exitoso` (A8-06).
- **No hay `dangerouslySetInnerHTML**` en todo el repo.
- `**SUPABASE_SERVICE_ROLE_KEY` solo en servidor**; no hay prefijo `NEXT_PUBLIC`_ aplicado a secretos.
- **Sin scripts `postinstall`/`preinstall`** — cadena de suministro reducida.
- **Validación UUID estricta** en `eliminar-matricula-pendiente.ts` antes de borrar.
- `**force-dynamic`** correctamente aplicado a las rutas API dinámicas.
- **Workflow de keep-alive** usa anon (no service_role) y referencia secretos con `${{ secrets.* }}`, no literales.
- `**.next/`, `node_modules/`, `tsconfig.tsbuildinfo`** excluidos del repo.

---

## 8. Mensaje ejecutivo (resumen para dirección)

> **"La seguridad del panel administrativo y del examen oficial depende de la buena fe del usuario. Un estudiante con conocimientos básicos de navegador puede ver las respuestas antes de contestar y registrarse como aprobado; alguien con `curl` puede leer todos los datos de los alumnos matriculados y modificar números de seguimiento. El flujo de pago en sí mismo está bien, pero el acceso posterior al examen no verifica adecuadamente quién paga."**

Las fases 1 y 2 del plan cierran esos dos vectores principales.

---

## Notas finales

- Este documento se genera como **plan de trabajo**, no como código. Ninguno de los cambios descritos se ha ejecutado.
- Las referencias cruzadas `A1-xx`, `A2-xx`, etc., corresponden a los IDs asignados por cada uno de los 10 agentes del review; pueden consultarse para ver evidencia detallada de cada finding individual.
- Cuando se implemente cada fase, se recomienda:
  1. Crear una rama dedicada por fase.
  2. Hacer PR con checklist de los items de la fase.
  3. Probar en entorno de staging con datos de prueba antes de merge a `main`.
  4. Rotar credenciales/secretos afectados al finalizar la fase correspondiente.