# Guía: Mantener Supabase Activo con GitHub Actions

## ¿Por qué necesito esto?

El plan gratuito de Supabase **pausa tu proyecto automáticamente** si no tiene actividad durante 7 días seguidos. Cuando se pausa, tu base de datos deja de funcionar y tu sitio web no podrá cargar preguntas de examen, matrículas ni nada que dependa de Supabase.

Para evitar esto, creamos un **trabajo automático** (GitHub Action) que hace una consulta simple a tu base de datos cada 5 días. Esto le dice a Supabase: "Oye, sigo usando el proyecto", y así nunca se pausa.

---

## ¿Qué es un GitHub Action?

Es una tarea automática que GitHub ejecuta por ti sin que tengas que hacer nada. Piensa en ello como una alarma programada: cada cierto tiempo, GitHub "despierta", hace lo que le pediste (en este caso, consultar tu base de datos), y se vuelve a dormir.

- Es **gratis** para repositorios públicos
- Para repositorios privados, tienes **2,000 minutos gratis al mes** (esta tarea usa menos de 1 minuto cada vez)
- Se ejecuta en servidores de GitHub, no en tu computadora

---

## Archivo del Workflow

El archivo ya está creado en tu proyecto en esta ubicación:

```
.github/workflows/keep-supabase-alive.yml
```

Este archivo le dice a GitHub:
1. **Cuándo ejecutar**: Cada 5 días a las 8:00 AM (hora UTC)
2. **Qué hacer**: Enviar una consulta simple a Supabase y verificar que responda correctamente
3. **Si falla**: Marcar la ejecución como fallida para que recibas una notificación

---

## Configuración Paso a Paso

### Paso 1: Subir el proyecto a GitHub

Si todavía no tienes tu proyecto en GitHub, necesitas crear un repositorio y subir los archivos. Si ya lo tienes, salta al Paso 2.

```bash
cd /Users/ramonsuarez/Desktop/BPS
git init
git add .
git commit -m "Primer commit del proyecto BPS"
```

Luego en GitHub:
1. Ve a [github.com](https://github.com) e inicia sesión
2. Haz clic en el botón verde **"New"** (o **"Nuevo repositorio"**)
3. Ponle un nombre (ejemplo: `bps-website`)
4. Elige si quieres que sea público o privado
5. Haz clic en **"Create repository"**
6. Copia los comandos que GitHub te muestra y ejecútalos en tu terminal:

```bash
git remote add origin https://github.com/TU-USUARIO/bps-website.git
git branch -M main
git push -u origin main
```

### Paso 2: Agregar los Secretos en GitHub

Los secretos son como contraseñas que GitHub guarda de forma segura. El workflow necesita dos secretos para poder conectarse a tu base de datos de Supabase.

1. Ve a tu repositorio en GitHub (ejemplo: `https://github.com/TU-USUARIO/bps-website`)
2. Haz clic en **"Settings"** (Configuración) — es la pestaña con el icono de engranaje
3. En el menú de la izquierda, busca **"Secrets and variables"** y haz clic
4. Selecciona **"Actions"**
5. Haz clic en el botón verde **"New repository secret"**

Agrega estos dos secretos (uno a la vez):

| Nombre del Secreto | Dónde encontrar el valor |
|---|---|
| `SUPABASE_URL` | Es la misma URL que tienes en tu archivo `.env.local` como `NEXT_PUBLIC_SUPABASE_URL`. Se ve algo así: `https://abcdefghij.supabase.co` |
| `SUPABASE_ANON_KEY` | Es la misma clave que tienes en `.env.local` como `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Es un texto largo que empieza con `eyJ...` |

Para cada secreto:
1. Escribe el nombre exacto en el campo **"Name"** (por ejemplo: `SUPABASE_URL`)
2. Pega el valor en el campo **"Secret"**
3. Haz clic en **"Add secret"**

### Paso 3: Verificar que Funciona

Después de agregar los secretos, puedes probar el workflow manualmente:

1. Ve a tu repositorio en GitHub
2. Haz clic en la pestaña **"Actions"** (tiene un icono de play ▶️)
3. En la lista de la izquierda, haz clic en **"Keep Supabase Alive"**
4. Haz clic en el botón **"Run workflow"** (aparece a la derecha)
5. Haz clic en el botón verde **"Run workflow"** que aparece en el menú desplegable

En unos segundos verás el resultado:
- **Marca verde (✓)**: Todo funcionó correctamente. Supabase respondió y tu proyecto seguirá activo.
- **Marca roja (✗)**: Algo falló. Haz clic en el resultado para ver los detalles del error.

---

## ¿Cómo saber si está funcionando?

### Ver el historial de ejecuciones
1. Ve a tu repositorio → pestaña **"Actions"**
2. Verás una lista de todas las ejecuciones con su estado (éxito o error)
3. Cada ejecución muestra la fecha y hora en que se ejecutó

### Recibir notificaciones si falla
GitHub te enviará un correo electrónico automáticamente si el workflow falla. Para verificar que las notificaciones están activadas:
1. Ve a [github.com/settings/notifications](https://github.com/settings/notifications)
2. Asegúrate de que **"Actions"** tenga las notificaciones por email activadas

---

## Preguntas Frecuentes

### ¿Cada cuánto se ejecuta?
Cada **5 días**. Como Supabase pausa después de 7 días, tenemos 2 días de margen de seguridad.

### ¿Me cuesta dinero?
No. GitHub Actions es gratis para repositorios públicos. Para privados, tienes 2,000 minutos gratis al mes y esta tarea usa menos de 1 minuto cada vez (se ejecuta unas 6 veces al mes = 6 minutos).

### ¿Qué pasa si cambio mis claves de Supabase?
Necesitas actualizar los secretos en GitHub. Ve a Settings → Secrets → haz clic en el secreto → Update → pega el nuevo valor.

### ¿Puedo cambiar la frecuencia?
Sí. Abre el archivo `.github/workflows/keep-supabase-alive.yml` y cambia la línea del cron:
- Cada 3 días: `'0 8 */3 * *'`
- Cada 5 días (actual): `'0 8 */5 * *'`
- Todos los días: `'0 8 * * *'`

### ¿Necesito tener mi computadora encendida?
No. GitHub Actions se ejecuta en los servidores de GitHub, no en tu computadora. Funciona aunque tu computadora esté apagada.

### ¿Qué hace exactamente la consulta?
Lee **una sola fila** de la tabla `exam_questions` (la tabla de preguntas de examen). Es la consulta más liviana posible — no modifica nada, solo lee.

---

## Resumen

| Qué | Detalle |
|---|---|
| Archivo | `.github/workflows/keep-supabase-alive.yml` |
| Frecuencia | Cada 5 días a las 8:00 AM UTC |
| Secretos necesarios | `SUPABASE_URL` y `SUPABASE_ANON_KEY` |
| Costo | Gratis |
| Requiere tu computadora | No |
| Ejecutar manualmente | GitHub → Actions → Keep Supabase Alive → Run workflow |
