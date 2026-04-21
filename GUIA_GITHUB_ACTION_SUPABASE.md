# Guía: Mantener Supabase Activo (Dos Capas de Seguridad)

## ¿Por qué necesito esto?

El plan gratuito de Supabase **pausa tu proyecto automáticamente** si no tiene actividad durante 7 días seguidos. Cuando se pausa, tu base de datos deja de funcionar y tu sitio web no podrá cargar preguntas de examen, matrículas ni nada que dependa de Supabase.

Para evitar esto, tenemos **dos capas de seguridad** trabajando en paralelo:


| Capa                       | Dónde corre                      | Frecuencia     | Ventaja                                       |
| -------------------------- | -------------------------------- | -------------- | --------------------------------------------- |
| **1. GitHub Action**       | En los servidores de GitHub      | Cada 3 días    | Llega desde afuera → ejercita la red y el API |
| **2. pg_cron en Supabase** | Dentro de la misma base de datos | Todos los días | No depende de GitHub; vive dentro de Supabase |


Con ambas capas encendidas, aunque una falle la otra sigue manteniendo el proyecto activo.

---

## Parte A — Configurar la GitHub Action (Capa 1)

### A.1 — ¿Qué cambió respecto a la versión anterior?

La versión anterior **nunca llegó a ejecutarse** porque faltaban los dos secretos en GitHub. Además tenía un problema de cron:

- La expresión `'0 8 */5 * *'` **no significa "cada 5 días"**. En cron, `*/5` sobre el día del mes quiere decir "días del mes divisibles por 5 desde el 1" → días **1, 6, 11, 16, 21, 26, 31**, y se reinicia cada mes. En meses de 30 días el gap entre el 26 y el 1 del siguiente mes es de **5 días**, muy al límite de los 7.
- La nueva expresión `'0 8 */3 * *'` da un gap máximo real de **3 días** (márgenes cómodos frente al umbral de 7) con aproximadamente **10 ejecuciones al mes**.

### A.2 — Ubicación del archivo

```
.github/workflows/keep-supabase-alive.yml
```

**Solo existe una copia** (la duplicación en `bps-website/.github/workflows/` fue eliminada para evitar confusión).

### A.3 — Agregar los dos secretos en GitHub (**PASO CRÍTICO**)

Este es el paso que faltaba. Sin los secretos, el workflow no puede autenticarse contra Supabase.

1. Abre tu repositorio: `https://github.com/rsuarez31-design/bps-certification-website`
2. Haz clic en la pestaña **Settings** (engranaje).
3. En el menú lateral izquierdo → **Secrets and variables** → **Actions**.
4. Haz clic en el botón verde **New repository secret**.
5. Agrega estos dos secretos, uno por uno:


| Nombre (exactamente así) | Valor                                                                                                             |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `SUPABASE_URL`           | Lo mismo que tienes en `.env.local` como `NEXT_PUBLIC_SUPABASE_URL`. Formato: `https://xxxxxxxxxxxx.supabase.co`  |
| `SUPABASE_ANON_KEY`      | Lo mismo que tienes en `.env.local` como `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Un texto largo que empieza con `eyJ...` |


**Importante:**

- Copia y pega el valor limpio, sin espacios ni saltos de línea al final.
- La URL **no** debe terminar con `/`.
- Los nombres deben coincidir exactamente con mayúsculas y guiones bajos.

### A.4 — Ejecutar manualmente una vez para verificar

1. En tu repositorio → pestaña **Actions**.
2. En la barra lateral izquierda → **Keep Supabase Alive**.
3. Botón **Run workflow** (lado derecho) → **Run workflow** en verde.
4. Refresca la página a los 20-30 segundos. Deberías ver:
  - Marca verde ✓ → todo correcto. Supabase respondió 200 con JSON válido.
  - Marca roja ✗ → lee el log (sección "Consultar Supabase") para ver qué falló.

### A.5 — Novedades de este workflow (mejoras frente a la versión anterior)

- **Validación de secretos**: si `SUPABASE_URL` o `SUPABASE_ANON_KEY` están vacíos o con formato incorrecto, falla de inmediato con un mensaje claro.
- **Reintentos automáticos**: hasta 3 intentos con espera de 10s → 30s → 90s entre ellos. Un hipo temporal de red ya no marca la ejecución como fallida.
- **Validación estricta de respuesta**: exige status exactamente `200` **y** que el cuerpo empiece con `[` (array JSON válido de PostgREST). Evita falsos positivos.
- **Permisos mínimos**: `permissions: contents: read` (buena práctica de seguridad).
- **Timeout de 5 minutos**: un curl colgado no consume horas de CI.
- **Concurrencia controlada**: no se solapan ejecuciones si una tarda más de lo esperado.

---

## Parte B — Configurar pg_cron dentro de Supabase (Capa 2)

Esta capa vive dentro de la propia base de datos: crea un job en Postgres (usando la extensión `pg_cron` que Supabase ya trae disponible) que ejecuta una consulta trivial **todos los días** a las 07:17 UTC.

### B.1 — Archivo

```
bps-website/supabase/keep-alive-pg-cron.sql
```

### B.2 — Cómo ejecutarlo (una sola vez)

1. Abre tu dashboard de Supabase: `https://supabase.com/dashboard` → selecciona tu proyecto.
2. En el menú lateral izquierdo → **SQL Editor**.
3. Haz clic en **New query**.
4. Abre el archivo `bps-website/supabase/keep-alive-pg-cron.sql` en tu editor, copia **todo** su contenido y pégalo en el SQL Editor.
5. Haz clic en **Run** (o `Cmd+Enter`).
6. Al final deberías ver una fila de resultado con:
  - `jobname = 'keep_alive_bps'`
  - `schedule = '17 7 * * *'`
  - `active = true`

### B.3 — Verificar después de instalado

En cualquier momento puedes ejecutar en el SQL Editor:

```sql
-- ¿Está el job activo?
SELECT jobid, jobname, schedule, active
  FROM cron.job
 WHERE jobname = 'keep_alive_bps';

-- ¿Se ha ejecutado recientemente?
SELECT * FROM cron.job_run_details
 WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'keep_alive_bps')
 ORDER BY start_time DESC
 LIMIT 10;
```

### B.4 — Cómo desinstalarlo (si algún día ya no lo necesitas)

```sql
SELECT cron.unschedule('keep_alive_bps');
```

### B.5 — ¿Es seguro? ¿Cuesta algo?

- **Seguro**: el script es idempotente (lo puedes ejecutar varias veces sin efectos adversos: detecta si el job ya existe y lo reemplaza).
- **Sin costo**: `pg_cron` está incluido gratis en el plan free de Supabase. El job lee una sola fila por día → consumo de CPU/IO prácticamente nulo.
- **No modifica datos**: solo hace `SELECT id FROM exam_questions LIMIT 1`.

---

## Troubleshooting — Si algo no funciona

### Síntoma: el workflow nunca se ejecutó (como pasó en tu caso)

**Causa más probable:** los secretos `SUPABASE_URL` y `SUPABASE_ANON_KEY` no están configurados en GitHub. Revisa la parte A.3.

**Causa secundaria:** si tu repositorio estuvo más de 60 días sin commits, issues o PRs, **GitHub desactiva automáticamente todos los workflows programados**. En ese caso verás un banner amarillo en la página del workflow que dice algo como *"This scheduled workflow is disabled because there hasn't been activity in this repository for at least 60 days"*. La solución es un clic en **Enable workflow** en esa misma página.

### Síntoma: la ejecución aparece en rojo

1. Abre la ejecución fallida en la pestaña **Actions**.
2. Lee el log del step **"Consultar Supabase (con reintentos)"**.
3. Códigos de respuesta típicos:


| Código        | Significado                                       | Acción                                                              |
| ------------- | ------------------------------------------------- | ------------------------------------------------------------------- |
| `401`         | Anon key incorrecta o expirada                    | Actualizar el secreto `SUPABASE_ANON_KEY` con el valor correcto     |
| `404`         | URL incorrecta o tabla `exam_questions` no existe | Revisar `SUPABASE_URL` y que el esquema esté instalado              |
| `000`         | No se pudo conectar (DNS/red/timeout)             | Reintentar; si persiste en varias ejecuciones avisar                |
| `503` / `504` | Supabase estuvo temporalmente fuera               | Reintentar manualmente; los 3 reintentos internos cubren la mayoría |


### Síntoma: pg_cron no aparece después de ejecutar el SQL

1. Confirmar que estás en el proyecto correcto (arriba a la izquierda del dashboard de Supabase).
2. Revisar que no haya error en el panel **Results** al ejecutar el SQL.
3. Ejecutar manualmente `SELECT * FROM cron.job;` — si no existe la tabla, `pg_cron` no se activó (muy raro); ejecuta `CREATE EXTENSION IF NOT EXISTS pg_cron;` por separado.

---

## Preguntas Frecuentes

### ¿Por qué dos capas en vez de una?

Porque cada una puede fallar por razones distintas:

- La GitHub Action depende de: que GitHub esté arriba, que los runners gratuitos estén disponibles, que el repo tenga actividad (regla de 60 días), que los secretos estén bien.
- pg_cron depende de: que la base de datos esté arriba (pero si la base está pausada estamos justamente en el problema que queremos evitar, por eso **no** puede ser la única capa).

Ambas juntas se cubren mutuamente.

### ¿Cada cuánto corre realmente cada una?

- **GitHub Action**: cada 3 días a las 8:00 UTC. Unas 10 ejecuciones al mes.
- **pg_cron**: todos los días a las 7:17 UTC. Unas 30 ejecuciones al mes.

### ¿Me cuesta dinero?

No. Ambas son gratis dentro del plan free.

### ¿Qué pasa si cambio mis claves de Supabase (rotación)?

- **GitHub Action**: ve a Settings → Secrets → Update y pega el nuevo valor.
- **pg_cron**: no se ve afectado, vive dentro de la misma base de datos.

### ¿Puedo cambiar la frecuencia?

**GitHub Action** — edita la línea `cron:` en el workflow:


| Expresión                | Gap máximo | Ejecuciones/mes |
| ------------------------ | ---------- | --------------- |
| `'0 8 */2 * *'`          | 2 días     | ~15             |
| `'0 8 */3 * *'` (actual) | 3 días     | ~10             |
| `'0 8 */4 * *'`          | 4 días     | ~7              |
| `'0 3,15 * * *'`         | 12 horas   | ~60             |


**pg_cron** — ejecuta en SQL Editor:

```sql
SELECT cron.alter_job(
  (SELECT jobid FROM cron.job WHERE jobname = 'keep_alive_bps'),
  schedule := '0 7 * * *'   -- o el cron que prefieras
);
```

---

## Resumen


| Qué                                    | Detalle                                               |
| -------------------------------------- | ----------------------------------------------------- |
| **Capa 1** — Archivo workflow          | `.github/workflows/keep-supabase-alive.yml`           |
| **Capa 1** — Frecuencia                | Cada 3 días a las 8:00 UTC (~10 ejecuciones/mes)      |
| **Capa 1** — Secretos requeridos       | `SUPABASE_URL` y `SUPABASE_ANON_KEY`                  |
| **Capa 2** — Archivo SQL               | `bps-website/supabase/keep-alive-pg-cron.sql`         |
| **Capa 2** — Frecuencia                | Todos los días a las 07:17 UTC (~30 ejecuciones/mes)  |
| **Capa 2** — Nombre del job            | `keep_alive_bps`                                      |
| Costo                                  | Gratis                                                |
| Requiere tu computadora                | No                                                    |
| Ejecutar GitHub Action manualmente     | GitHub → Actions → Keep Supabase Alive → Run workflow |
| Ejecutar pg_cron manualmente (una vez) | Supabase → SQL Editor → pegar y ejecutar el `.sql`    |


