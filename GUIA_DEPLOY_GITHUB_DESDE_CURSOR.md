# Guía: Cómo Subir Cambios a GitHub desde Cursor

Esta guía explica cómo usar la regla automática de Cursor para subir (push) los cambios de tu proyecto BPS al repositorio de GitHub cada vez que quieras publicar una actualización.

---

## Información del Repositorio


| Dato                     | Valor                                                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| **Repositorio**          | [https://github.com/rsuarez31-design/bps-certification-website](https://github.com/rsuarez31-design/bps-certification-website) |
| **Branch**               | `main`                                                                                                                         |
| **Carpeta del proyecto** | `/Users/ramonsuarez/Desktop/BPS/bps-website`                                                                                   |


---

## ¿Qué es la "Regla" de Cursor?

Es un archivo especial (`.cursor/rules/deploy-to-github.mdc`) que le dice a Cursor **exactamente qué hacer** cada vez que le pides subir cambios a GitHub. Es como una lista de instrucciones automáticas que Cursor sigue paso a paso:

1. Verificar que el código compila sin errores (`npm run build`)
2. Revisar qué archivos cambiaron
3. Agregar los archivos al "paquete" de cambios
4. Crear un mensaje describiendo los cambios
5. Enviar todo a GitHub

---

## Cómo Usar la Regla (Paso a Paso)

### Paso 1: Termina de hacer tus cambios

Antes de subir, asegúrate de que todos los cambios que quieres publicar estén guardados en Cursor. Puedes verificar guardando todos los archivos con `Cmd + S` (Mac) o `Ctrl + S` (Windows).

### Paso 2: Abre el chat de Cursor

Haz clic en el ícono de chat de Cursor (el panel del lado derecho) o usa el atajo `Cmd + L` (Mac) / `Ctrl + L` (Windows).

### Paso 3: Escribe el comando

Puedes usar cualquiera de estas frases y Cursor activará la regla automáticamente:

```
Sube los cambios a GitHub
```

```
Push al repositorio
```

```
Deploy los cambios al repo
```

```
Publica la versión actual en GitHub
```

### Paso 4: Cursor ejecutará automáticamente

Cursor va a:

1. **Compilar el proyecto** → Si hay errores, te los mostrará y los corregirá antes de continuar
2. **Revisar los cambios** → Te mostrará un resumen de qué archivos se modificaron
3. **Crear el commit** → Con un mensaje descriptivo en español
4. **Pedirte confirmación** → Te mostrará una pregunta con botones "Sí" / "No"
5. **Hacer el push** → Solo si respondiste "Sí", envía todo a GitHub
6. **Confirmarte** → Te dirá que todo salió bien y te dará el link del repositorio

### Paso 5: Confirma el push

Cursor te mostrará una pregunta como esta:

> **¿Confirmas que deseas subir estos cambios a GitHub?**
>
> - Sí, subir a GitHub
> - No, cancelar

- Si haces clic en **"Sí"**, Cursor enviará los cambios a GitHub.
- Si haces clic en **"No"**, Cursor detendrá el proceso. Tu commit quedará guardado localmente pero **no se subirá** a GitHub. Puedes subirlo más tarde repitiendo el comando.

### Paso 5: Verifica en GitHub

Puedes abrir tu navegador e ir a:
**[https://github.com/rsuarez31-design/bps-certification-website](https://github.com/rsuarez31-design/bps-certification-website)**

Ahí verás todos tus cambios publicados.

---

## Ejemplos de Uso Común

### Después de hacer cambios pequeños (ej: corregir un texto)

```
Sube los cambios a GitHub
```

### Después de una actualización grande (ej: nueva funcionalidad)

```
Sube los cambios a GitHub. Los cambios incluyen: nueva sección de contacto y correcciones en el formulario de matrícula.
```

> **Tip**: Si describes los cambios, Cursor usará esa descripción para el mensaje del commit.

### Si solo quieres verificar sin subir

```
Verifica si el proyecto compila sin errores
```

---

## Preguntas Frecuentes

### ¿Qué pasa si hay errores al compilar?

Cursor intentará corregirlos automáticamente. Si no puede, te mostrará los errores y te pedirá que los revises.

### ¿Qué pasa si alguien más hizo cambios en GitHub?

Cursor te avisará que hay cambios en el repositorio que no tienes localmente. Te preguntará si quieres descargar esos cambios primero (esto se llama `pull`). Responde "sí" y Cursor se encargará.

### ¿Se suben mis contraseñas o claves secretas?

**No.** El proyecto tiene un archivo `.gitignore` que automáticamente excluye:

- `.env.local` (donde están tus claves de Supabase, Stripe, etc.)
- `node_modules/` (las librerías instaladas)
- `.next/` (los archivos de compilación)

Además, la regla de Cursor verifica esto antes de subir.

### ¿Puedo deshacer un push?

Técnicamente sí, pero es complicado. Lo mejor es asegurarte de que todo esté bien **antes** de subir. Si necesitas deshacer algo, pídele a Cursor:

```
Necesito revertir el último commit, ¿qué opciones tengo?
```

### ¿Puedo crear versiones (tags)?

Sí. Después de hacer push, puedes pedirle a Cursor:

```
Crea un tag de versión v2.0 y súbelo a GitHub
```

Para más detalles sobre versiones, revisa el archivo `GUIA_GITHUB_Y_VERSIONES.md`.

---

## Archivos Importantes


| Archivo                              | Qué hace                                                                      |
| ------------------------------------ | ----------------------------------------------------------------------------- |
| `.cursor/rules/deploy-to-github.mdc` | La regla automática que Cursor sigue para hacer el deploy                     |
| `.gitignore`                         | Lista de archivos que git **nunca** debe subir (secretos, node_modules, etc.) |
| `GUIA_GITHUB_Y_VERSIONES.md`         | Guía completa sobre git, versiones y branches                                 |
| `GUIA_GITHUB_ACTION_SUPABASE.md`     | Guía del job automático que mantiene Supabase activo                          |


---

## Resumen Rápido

```
1. Guarda tus cambios en Cursor (Cmd+S)
2. Abre el chat de Cursor (Cmd+L)
3. Escribe: "Sube los cambios a GitHub"
4. Cursor compila, revisa y crea el commit
5. Cursor te pregunta: "¿Confirmas?" → Haz clic en "Sí"
6. Verifica en: https://github.com/rsuarez31-design/bps-certification-website
```

¡Eso es todo! Cada vez que quieras publicar cambios, solo necesitas escribir una frase en el chat de Cursor.