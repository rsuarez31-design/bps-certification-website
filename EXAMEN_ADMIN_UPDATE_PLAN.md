# Plan de Actualizacion: CRUD de Banco de Preguntas (Admin)

> **Estado:** Aprobado, pendiente de ejecucion.
> **Fecha del plan:** 20 de abril de 2026.
> **Alcance:** Panel administrativo -> pestana "Banco de Preguntas".
> **Objetivo:** permitir al administrador crear, editar y eliminar preguntas del examen (y sus campos: texto, 4 opciones, respuesta correcta, hint, imagen), desde la misma UI donde hoy solo puede "Ver detalles".

---

## Decisiones confirmadas por el usuario

| # | Tema | Decision |
|---|---|---|
| 1 | Borrado de preguntas | **Soft delete** (nueva columna `is_active`). Preserva auditoria historica de `exam_attempt_answers`. |
| 2 | Limite del banco | **Cap 75** preguntas activas. "Nueva pregunta" bloqueada cuando se llega al limite. |
| 3 | Archivo local `data/examQuestions.ts` | Mostrar **banner en admin** cuando hay divergencia con Supabase + proceso automatizado via Cursor para regenerar el archivo y commit+push. |
| 4 | Auditoria (`updated_at`, `updated_by`) | **Omitir** (solo hay un admin, sobra). |
| 5 | `correct_index` y respuestas historicas | **OK tal cual**: las filas de `exam_attempt_answers.is_correct` quedan con el valor del momento en que se respondio. El tab "Preguntas Falladas" contara como incorrecta una respuesta que con la clave nueva seria correcta -- es el comportamiento deseado (auditoria fiel). |

---

## Estado actual (referencia)

**Base de datos** (`supabase/schema.sql:16-26`):

```sql
CREATE TABLE IF NOT EXISTS exam_questions (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_index INT NOT NULL CHECK (correct_index BETWEEN 0 AND 3),
  hint TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT ''
);
```

`exam_attempt_answers.question_id` NO tiene FK hacia `exam_questions.id`, asi que soft-delete no rompe nada; las respuestas historicas siguen apuntando al `id` aunque la pregunta este inactiva.

**APIs existentes** en `app/api/admin/questions/`:

- `GET  /api/admin/questions`            -> lista todas (usado por panel)
- `POST /api/admin/questions/:id/image`   -> subir imagen al bucket `exam-images`
- `DELETE /api/admin/questions/:id/image` -> borrar imagen

**UI actual** (`app/admin/page.tsx:1039-1144`):

- Modal "Ver detalles" **solo lectura** (texto + 4 opciones + marca respuesta correcta).
- Sub-seccion de imagen si permite subir / reemplazar / eliminar.
- No hay forma de editar texto, opciones, `correct_index`, `hint`, ni de crear o borrar preguntas.

---

## Fase 0 -- Migracion SQL (prerequisito)

**Archivo nuevo: `supabase/migracion-v5-soft-delete-banco.sql`**

```sql
-- Migracion v5: Soft delete para banco de preguntas
-- Idempotente: se puede correr mas de una vez sin romper nada.

ALTER TABLE exam_questions
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- Indice parcial: la mayoria de queries filtran por activas.
CREATE INDEX IF NOT EXISTS idx_exam_questions_active
  ON exam_questions(is_active)
  WHERE is_active = TRUE;
```

Backfill implicito: toda fila existente queda `is_active = TRUE`.

**Actualizar** `supabase/schema.sql` (solo fuente de verdad del repo, no altera la BD): reflejar la columna `is_active BOOLEAN NOT NULL DEFAULT TRUE` dentro del `CREATE TABLE` para que cualquiera que recree la BD desde cero tenga el esquema al dia.

**Ejecucion:** el admin corre el SQL manualmente en el SQL Editor de Supabase (no se ejecuta desde el codigo). El desarrollador genera el archivo; el admin lo aplica.

---

## Fase 1 -- Filtrar `is_active = true` donde aplica

Tres lugares:

1. **`lib/questions-loader.ts:34-54`** (funcion `cargarPreguntas`):
   Al SELECT de `exam_questions` agregar `.eq('is_active', true)`. Asi las soft-deleted no aparecen en ningun examen (oficial ni practica).

2. **`app/admin/page.tsx` -> `loadFailedQuestions`**:
   En el lookup de `exam_questions` filtrar `is_active = true`. Las preguntas inactivas ya no aparecen en el top 10 (es pedagogicamente correcto: no las estudiamos, ya no las preguntamos).

3. **`app/api/admin/questions/route.ts` (GET)**:
   Filtrar `is_active = true`. El panel solo ve activas.

---

## Fase 2 -- Backend: CRUD de preguntas

### 2.1 Ampliar `app/api/admin/questions/route.ts`

Agregar **`POST`**:

- Valida el payload (ver "Validaciones" abajo).
- Antes de insertar, consulta `SELECT COUNT(*) FROM exam_questions WHERE is_active = true`.
  - Si `count >= 75` -> responde `409 Conflict` con:
    ```json
    { "error": "El banco ya tiene 75 preguntas activas. Elimina una antes de crear una nueva." }
    ```
- Si OK: `INSERT` y devuelve la fila creada (incluye el nuevo `id` SERIAL).

### 2.2 Archivo nuevo: `app/api/admin/questions/[id]/route.ts`

Metodos:

- **`GET`** -> fetch puntual (util para refrescar tras editar, aunque en la practica el PUT ya devuelve la fila).
- **`PUT`** -> actualiza solo campos editables:
  - `question`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_index`, `hint`.
  - **Nunca** permite cambiar `id`, `image_url` (su endpoint dedicado lo maneja), ni `is_active` (el DELETE lo maneja).
  - Valida el payload.
  - Devuelve la fila actualizada.
- **`DELETE`** -> **soft delete**:
  - `UPDATE exam_questions SET is_active = false, image_url = '' WHERE id = :id`.
  - Ademas, si habia imagen en el bucket `exam-images`, la elimina (reusar `extraerPathDelBucket` de `app/api/admin/questions/[id]/image/route.ts:41-48`) para no dejar huerfanos.
  - No hace `DELETE` real -- preserva el `id` para que las filas historicas de `exam_attempt_answers` sigan siendo resolubles si se reactiva en el futuro.

### 2.3 Archivo nuevo: `app/api/admin/questions/fingerprint/route.ts`

**`GET`** -> calcula y devuelve:

```json
{ "count": 75, "fingerprint": "sha256-abc123..." }
```

El fingerprint es **SHA256 hex** sobre la concatenacion (con separador `|`) de todas las preguntas activas ordenadas por `id`, incluyendo: `id|question|option_a|option_b|option_c|option_d|correct_index|hint|image_url`. Una linea por pregunta, separadas por `\n`.

La **misma funcion de fingerprint** se usa en el script `scripts/sync-exam-questions.mjs` (Fase 4.3) -- importante que sean byte-identicos para que la comparacion cliente/servidor funcione.

### 2.4 Validaciones (POST y PUT, client-side y server-side)

| Campo | Regla |
|---|---|
| `question` | Requerido, no vacio tras trim, longitud `<= 2000`. |
| `option_a..d` | Requeridos, no vacios tras trim, longitud `<= 500`. |
| `correct_index` | Entero, `0 <= n <= 3`. Match del CHECK del schema. |
| `hint` | Opcional, string, longitud `<= 1000`. Default `''`. |

Los mismos errores se devuelven con codigo HTTP `400` y un cuerpo:

```json
{ "error": "mensaje", "field": "option_c" }
```

Para que la UI marque el campo especifico.

### 2.5 Seguridad

Todas las rutas usan `supabaseAdmin` (service_role), igual que el resto de `/api/admin/*`. El acceso esta protegido por el login `/api/admin/verify` que ya existe.

---

## Fase 3 -- UI: editar / crear / eliminar en el modal

Todo en `app/admin/page.tsx`.

### 3.1 Estado nuevo

```typescript
const [editMode, setEditMode] = useState(false);
const [creatingNew, setCreatingNew] = useState(false);
const [draftQuestion, setDraftQuestion] = useState<BankQuestion | null>(null);
const [savingQuestion, setSavingQuestion] = useState(false);
const [deletingQuestion, setDeletingQuestion] = useState(false);
const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
```

`draftQuestion` es la copia editada localmente. No se muta `selectedBankQuestion` hasta que el PUT devuelva 200.

### 3.2 Modal de detalle refactorizado

**Modo vista (default):**

Igual a la UI actual (texto, 4 opciones con highlight verde en la correcta, hint, imagen). Se agregan:

- Boton **"Editar"** en el header -> activa `editMode` y copia `selectedBankQuestion` a `draftQuestion`.
- Seccion de `hint` visible en modo vista (hoy no se muestra).
- Boton rojo **"Eliminar pregunta"** al final (ver 3.4).

**Modo edicion:**

- `<textarea>` para `question`.
- 4 `<input>` para `option_a..d`.
- 4 radios para `correct_index` mostrando A/B/C/D.
- `<textarea>` para `hint`.
- Mensajes de error inline bajo cada campo (de `fieldErrors`).
- Contadores de caracteres (suaves, no bloquean) para dar feedback de limites.
- Botones:
  - **Guardar** -> PUT `/api/admin/questions/:id`. Spinner mientras `savingQuestion`. Exitoso -> `selectedBankQuestion` y `bankQuestions` se actualizan con la respuesta del server, `editMode = false`, `markStale('bank')` y `markStale('questions')`.
  - **Cancelar** -> descarta `draftQuestion`, vuelve a modo vista.

La seccion de imagen (subir / reemplazar / eliminar) se mantiene **igual** y sigue funcionando independiente del modo edicion.

### 3.3 Modal de creacion

- Boton **"+ Nueva pregunta"** en el header del tab Banco, junto al de "Recargar".
- Deshabilitado con tooltip si `bankQuestions.length >= 75` ("Limite de 75 preguntas alcanzado. Elimina una antes de crear.").
- Abre un modal con el mismo layout que modo edicion (sin `id`, sin seccion de imagen).
- Al guardar:
  - POST `/api/admin/questions`. Si 409 (cap 75) -> muestra el mensaje del server en un banner dentro del modal.
  - Si 200 -> agrega la fila al array `bankQuestions`, cierra el modal, `markStale('bank')`.
  - El admin puede abrir la pregunta recien creada y subir imagen con la UI actual.

### 3.4 Eliminar pregunta

- Boton rojo "Eliminar pregunta" al final del modal de detalle.
- `window.confirm()` con texto:

  > "Eliminar la Pregunta #X?
  > La pregunta se ocultara del examen y del panel.
  > Las respuestas historicas de estudiantes quedaran intactas,
  > pero la pregunta ya no contara en 'Preguntas Falladas'.
  > Esta accion es reversible editando `is_active` desde Supabase.
  > Confirmar?"

- Si el admin acepta -> DELETE `/api/admin/questions/:id` (soft delete).
- Si 200 -> remueve la fila del array local, cierra el modal, `markStale('bank')` y `markStale('questions')`.

---

## Fase 4 -- Sincronizacion del archivo local

### 4.1 Constantes nuevas en `data/examQuestions.ts`

Al final del archivo (despues del array `examQuestions`):

```typescript
/**
 * Fingerprint de las preguntas tal como estaban cuando se genero este archivo.
 * Se compara contra el endpoint GET /api/admin/questions/fingerprint para
 * detectar divergencia. Si difieren, el admin ve un banner pidiendo correr
 * `npm run sync:questions`.
 *
 * Estas 3 constantes se regeneran automaticamente por el script de sync.
 */
export const EXAM_QUESTIONS_FINGERPRINT = 'sha256-xxxxxx...';
export const EXAM_QUESTIONS_SYNCED_AT = '2026-04-20T00:00:00Z';
export const EXAM_QUESTIONS_COUNT = 75;
```

El valor inicial se siembra corriendo `npm run sync:questions` una vez al terminar toda la implementacion -- asi nacemos en estado "sincronizado" sin banner.

### 4.2 Banner de desincronizacion en `app/admin/page.tsx`

**Flujo:**

1. Al activar la pestana Banco (primera vez o si el TTL lo pide), ademas de `loadBankQuestions()`, se llama a `loadFingerprintCheck()`.
2. `loadFingerprintCheck()` hace `GET /api/admin/questions/fingerprint` y compara con `EXAM_QUESTIONS_FINGERPRINT` + `EXAM_QUESTIONS_COUNT`.
3. Si alguno difiere -> `setFallbackOutOfSync(true)` con detalle.

**UI del banner** (arriba de la lista del tab Banco):

```
+-----------------------------------------------------------------+
| [!] Archivo local de respaldo desincronizado                    |
|                                                                 |
| Has editado el banco desde el panel, pero el archivo local      |
| `data/examQuestions.ts` (respaldo si Supabase cae) sigue con la |
| version anterior.                                               |
|                                                                 |
| Para sincronizarlo, abre Cursor en el proyecto y ejecuta:       |
|                                                                 |
|   npm run sync:questions                                        |
|   git add data/examQuestions.ts                                 |
|   git commit -m "chore: sincroniza banco de preguntas"          |
|   git push                                                      |
|                                                                 |
| O pide al agente de Cursor: "sincroniza el banco de preguntas"  |
|                                                                 |
| Diferencia: BD tiene 76 preguntas activas, local tiene 75.      |
| Ultima sync: 2026-04-20 00:00 UTC.                              |
|                                                                 |
| [ Copiar comandos ]                                             |
+-----------------------------------------------------------------+
```

Botones:

- **"Copiar comandos"** -> copia al portapapeles el bloque de 4 comandos.
- (Opcional) **"Volver a verificar"** -> re-fetcha fingerprint tras ejecutar el script.

### 4.3 Script nuevo: `scripts/sync-exam-questions.mjs`

Plain ESM (`.mjs`). Usa `@supabase/supabase-js` que ya esta en deps. No requiere `tsx` ni compilacion.

**Flujo:**

1. Carga `.env.local` (sin libreria: parseo simple).
2. Valida que existan `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`. Si faltan -> error claro con instrucciones.
3. Conecta a Supabase con service_role.
4. `SELECT id, question, option_a, option_b, option_c, option_d, correct_index, hint, image_url FROM exam_questions WHERE is_active = true ORDER BY id`.
5. Calcula fingerprint SHA256 (**misma funcion** que el endpoint de Fase 2.3).
6. Regenera `data/examQuestions.ts` completo con:
   - Header comentado con fecha y cuenta (mantiene el comentario original del archivo).
   - `export interface ExamQuestion` identica a hoy.
   - `export const examQuestions: ExamQuestion[] = [ ... ];` (literal formateado).
   - Las 3 constantes de Fase 4.1 con valores actualizados.
7. Imprime:

   ```
   [OK] Sincronizadas 76 preguntas desde Supabase.
        Fingerprint: sha256-abc123...
        Archivo:     data/examQuestions.ts
        Siguiente:   git add data/examQuestions.ts && git commit && git push
   ```

**Manejo de errores:** si algun campo viene null o invalido, aborta sin tocar el archivo y reporta el problema.

### 4.4 `package.json`

Agregar script:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "sync:questions": "node scripts/sync-exam-questions.mjs"
}
```

### 4.5 Cursor rule: `.cursor/rules/sincronizar-banco-preguntas.mdc`

```markdown
---
description: Proceso automatizado para sincronizar el banco de preguntas del examen entre Supabase y el archivo local de respaldo.
alwaysApply: false
---

# Sincronizar banco de preguntas

Activar este flujo cuando el usuario diga cosas como:
- "sincroniza el banco de preguntas"
- "sync banco"
- "actualiza el archivo local de preguntas"
- "el banner del admin pide sincronizar"
- o cualquier variante que pida alinear `data/examQuestions.ts` con Supabase.

## Pasos

1. Ejecutar `npm run sync:questions` y mostrar el output completo.
2. Si el script **fallo**, reportar el error y detenerse (no hacer commit).
3. Si el script fue **exitoso**:
   a. Correr `git status --short` para confirmar que SOLO cambio `data/examQuestions.ts`.
      - Si hay otros archivos modificados, preguntar al usuario antes de commitear.
   b. `git add data/examQuestions.ts`
   c. `git commit -m "chore: sincroniza banco de preguntas con Supabase"`
   d. `git push origin main`
4. Reportar al usuario: cuenta de preguntas sincronizadas, nuevo fingerprint, hash del commit.

## Precondiciones

- `.env.local` debe tener `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`.
- El usuario debe estar en la rama `main` (si no, avisar y preguntar).
```

### 4.6 Documentacion

**Actualizar `COMIENZA_AQUI.md`** con una seccion nueva al final:

```markdown
## Mantenimiento del banco de preguntas

La fuente de verdad son las filas de `exam_questions` en Supabase. El panel
administrativo permite crear/editar/eliminar preguntas en tiempo real.

El archivo `data/examQuestions.ts` es un **respaldo local** que se usa si
Supabase no responde. Cuando editas el banco desde el panel, este archivo
queda desactualizado y veras un banner rojo en la pestana "Banco de
Preguntas".

### Sincronizar el archivo local

Desde Cursor:

- Di al agente: **"sincroniza el banco de preguntas"** -- el agente ejecuta
  el script, commitea y pushea automaticamente.

Manual:

```bash
npm run sync:questions
git add data/examQuestions.ts
git commit -m "chore: sincroniza banco de preguntas"
git push
```

El script regenera `data/examQuestions.ts` leyendo directamente de Supabase
(solo preguntas con `is_active = true`) y actualiza las constantes
`EXAM_QUESTIONS_FINGERPRINT`, `EXAM_QUESTIONS_SYNCED_AT`, `EXAM_QUESTIONS_COUNT`.
```

(Opcional: crear `MANTENIMIENTO_BANCO_PREGUNTAS.md` aparte si se prefiere dejarlo fuera de `COMIENZA_AQUI.md`.)

---

## Archivos que se tocaran

| Archivo | Cambio |
|---|---|
| `supabase/migracion-v5-soft-delete-banco.sql` | **Nuevo** -- ALTER TABLE + index |
| `supabase/schema.sql` | Agregar `is_active` al `CREATE TABLE` |
| `lib/questions-loader.ts` | Filtro `.eq('is_active', true)` |
| `app/api/admin/questions/route.ts` | Filtro `is_active` + metodo `POST` con cap 75 |
| `app/api/admin/questions/[id]/route.ts` | **Nuevo** -- `GET`, `PUT`, `DELETE` (soft) |
| `app/api/admin/questions/fingerprint/route.ts` | **Nuevo** -- GET con SHA256 |
| `app/admin/page.tsx` | Estado edicion, modal editable, modal crear, boton eliminar, banner sync, filtro `is_active` en `loadFailedQuestions` |
| `data/examQuestions.ts` | Agregar 3 constantes (fingerprint/synced_at/count) |
| `scripts/sync-exam-questions.mjs` | **Nuevo** -- script de sincronizacion |
| `package.json` | `"sync:questions"` |
| `.cursor/rules/sincronizar-banco-preguntas.mdc` | **Nuevo** -- rule del flujo Cursor |
| `COMIENZA_AQUI.md` | Seccion nueva "Mantenimiento del banco de preguntas" |

---

## Orden de ejecucion sugerido

1. **Fase 0**: generar la migracion SQL. El admin la corre manualmente en Supabase Dashboard (SQL Editor).
2. **Fase 1**: agregar filtros `is_active = true` en los tres lugares -- el examen publico y el panel siguen funcionando igual con las 75 actuales.
3. **Fase 2**: endpoints CRUD + fingerprint.
4. **Fase 3**: UI editar / crear / eliminar.
5. **Fase 4**: banner, script, `npm run sync:questions`, Cursor rule, docs.
6. **Sembrado inicial del fingerprint**: correr `npm run sync:questions` una vez -- esto reescribe `data/examQuestions.ts` alineado con Supabase y pone el fingerprint correcto. Esto debe ser el **ultimo paso antes del commit final** para que el repo nazca en estado "sincronizado" y ningun banner aparezca al hacer deploy.
7. **Build + lint + commit + push**.

---

## Validaciones finales antes de cerrar

- [ ] `npx tsc --noEmit` pasa limpio.
- [ ] `npm run lint` sin errores nuevos.
- [ ] `npm run build` compila.
- [ ] Manualmente:
  - [ ] Crear una pregunta -> aparece en el listado.
  - [ ] Con 75 activas, el boton "Nueva pregunta" esta deshabilitado con tooltip.
  - [ ] Editar: cambiar texto, opciones, correct_index, hint -> persiste y se refleja.
  - [ ] Cancelar edicion: no muta el estado.
  - [ ] Eliminar: la pregunta desaparece del panel y del examen publico.
  - [ ] Banner de sync aparece tras editar algo y desaparece tras correr el script.
  - [ ] Script `npm run sync:questions` produce un `data/examQuestions.ts` con el fingerprint correcto.
  - [ ] Cursor rule: decir "sincroniza el banco" hace el flujo completo.

---

## Puntos abiertos / riesgos

1. **Consistencia del fingerprint**: la funcion que lo calcula en el endpoint (Fase 2.3) y en el script (Fase 4.3) debe ser **byte-identica** (mismo separador, mismo orden de campos, mismo encoding). Si hay drift, el banner aparecera siempre aunque este sincronizado. Recomendacion: mover la funcion a un helper compartido en `lib/exam-questions-fingerprint.ts` y reusarla en ambos lugares.
2. **Imagen de la pregunta #28 (`/exam-images/boat-q28.png`)**: es una ruta relativa a `/public`, no vive en el bucket. El soft delete debe respetar eso igual que el DELETE de imagen actual (ver `extraerPathDelBucket` en el endpoint de imagen).
3. **Despliegues a Vercel entre sync y edicion**: si el admin edita y aun no corrio el script, y ocurre un build de Vercel, el deploy sale con el `data/examQuestions.ts` antiguo pero el sitio **si** lee de Supabase en runtime, asi que no hay impacto para el usuario final. El banner en admin persiste hasta que el admin ejecute el sync.
4. **Concurrencia**: un solo admin, sin race conditions relevantes. Si algun dia hay multiples admins, habria que revisar locking optimista.
5. **Reactivar preguntas eliminadas**: hoy no hay UI para ello. Si se necesita, se podria agregar un filtro "Ver eliminadas" en el panel que muestre `is_active = false` y permita reactivar. Fuera del alcance de este plan pero facil de anadir luego.

---

## Como retomar este plan en el futuro

1. Abrir este documento.
2. Confirmar que las decisiones 1-5 siguen siendo validas.
3. Pasar al agente de Cursor el mensaje: **"Ejecuta el plan descrito en `EXAMEN_ADMIN_UPDATE_PLAN.md`"**.
4. El agente sigue el orden de ejecucion (seccion "Orden de ejecucion sugerido").
5. El admin corre la migracion SQL cuando el agente lo pida.
6. Al final, el agente siembra el fingerprint inicial y hace commit+push.

---

**Fin del plan.**
