# Guía Completa: Subir tu Proyecto a GitHub y Manejar Versiones

## Tabla de Contenido

1. [¿Qué es Git y GitHub?](#1-qué-es-git-y-github)
2. [Instalación y Configuración Inicial](#2-instalación-y-configuración-inicial)
3. [Crear tu Repositorio en GitHub](#3-crear-tu-repositorio-en-github)
4. [Subir tu Proyecto por Primera Vez](#4-subir-tu-proyecto-por-primera-vez)
5. [Guardar Cambios (Commits)](#5-guardar-cambios-commits)
6. [Crear Versiones con Tags](#6-crear-versiones-con-tags)
7. [Trabajar con Ramas (Branches)](#7-trabajar-con-ramas-branches)
8. [Flujo de Trabajo Diario](#8-flujo-de-trabajo-diario)
9. [Comandos Rápidos de Referencia](#9-comandos-rápidos-de-referencia)
10. [Errores Comunes y Soluciones](#10-errores-comunes-y-soluciones)

---

## 1. ¿Qué es Git y GitHub?

### Git
Git es un programa que **guarda el historial de cambios** de tu proyecto. Cada vez que haces un cambio importante, le dices a Git: "Guarda esto". Así puedes:
- Ver qué cambió y cuándo
- Volver a una versión anterior si algo se rompe
- Trabajar en nuevas funciones sin afectar lo que ya funciona

Piénsalo como un "Control+Z" súper potente que recuerda **toda** la historia de tu proyecto.

### GitHub
GitHub es un sitio web donde **subes tu proyecto** para tenerlo guardado en la nube. Es como Google Drive pero diseñado específicamente para código. Ventajas:
- Tu código está seguro aunque tu computadora se dañe
- Puedes acceder desde cualquier lugar
- Permite que otras personas colaboren contigo
- Es donde se ejecutan los GitHub Actions (como el que mantiene Supabase activo)

### ¿Cuál es la diferencia?
- **Git** = el programa que instalas en tu computadora
- **GitHub** = el sitio web donde subes tu código

---

## 2. Instalación y Configuración Inicial

### Verificar si ya tienes Git instalado

Abre la Terminal y escribe:

```bash
git --version
```

Si ves algo como `git version 2.39.0`, ya lo tienes. Si no, instálalo:

### Instalar Git en Mac

```bash
xcode-select --install
```

Esto instalará Git junto con otras herramientas de desarrollo de Apple. Sigue las instrucciones que aparecen en pantalla.

### Configurar tu nombre y correo

Esto es obligatorio y solo se hace una vez. Git usa esta información para identificar quién hizo cada cambio:

```bash
git config --global user.name "Tu Nombre Completo"
git config --global user.email "tu-correo@ejemplo.com"
```

**Importante**: Usa el **mismo correo** que usaste para crear tu cuenta de GitHub.

### Crear una cuenta en GitHub

1. Ve a [github.com](https://github.com)
2. Haz clic en **"Sign up"**
3. Sigue los pasos para crear tu cuenta (es gratis)

---

## 3. Crear tu Repositorio en GitHub

Un **repositorio** (o "repo") es como una carpeta en GitHub donde vive tu proyecto.

### Paso a paso:

1. Inicia sesión en [github.com](https://github.com)
2. En la esquina superior derecha, haz clic en el **"+"** y selecciona **"New repository"**
3. Completa los campos:
   - **Repository name**: `bps-website` (o el nombre que prefieras)
   - **Description**: `Sitio web de Americas Boating Club - Boquerón Power Squadron`
   - **Visibilidad**: Elige **Private** (privado) si no quieres que sea público
   - **NO** marques ninguna de las casillas de abajo (no inicialices con README ni .gitignore, ya los tenemos)
4. Haz clic en **"Create repository"**

GitHub te mostrará una página con instrucciones. **No cierres esa página**, la necesitarás en el siguiente paso.

---

## 4. Subir tu Proyecto por Primera Vez

Abre la Terminal y ejecuta los siguientes comandos **uno a la vez**:

### 4.1 Navegar a la carpeta del proyecto

```bash
cd /Users/ramonsuarez/Desktop/BPS
```

### 4.2 Inicializar Git en tu proyecto

```bash
git init
```

Esto le dice a Git: "Empieza a rastrear los cambios en esta carpeta". Solo se hace una vez.

### 4.3 Crear el archivo .gitignore principal

Tu proyecto ya tiene un `.gitignore` dentro de `bps-website/`, pero necesitamos uno en la raíz para proteger archivos sensibles de todo el proyecto:

```bash
cat > .gitignore << 'EOF'
# Archivos del sistema operativo Mac
.DS_Store
**/.DS_Store

# Variables de entorno (contienen contraseñas y claves secretas)
.env*.local
**/.env*.local

# Dependencias (se reinstalan con npm install)
**/node_modules/

# Archivos generados por Next.js
**/.next/
**/out/
**/build/

# Archivos de Vercel
**/.vercel

# TypeScript
*.tsbuildinfo
**/next-env.d.ts

# Logs
*.log
npm-debug.log*

# Archivos de editor
.vscode/
.idea/
EOF
```

**¿Por qué existe el .gitignore?** Hay archivos que **nunca** deben subirse a GitHub:
- `.env.local` — contiene tus contraseñas de Supabase, Stripe, etc.
- `node_modules/` — son miles de archivos que se pueden reinstalar con `npm install`
- `.next/` — archivos temporales que Next.js genera automáticamente

### 4.4 Agregar todos los archivos

```bash
git add .
```

Esto le dice a Git: "Prepara todos los archivos para guardarlos". El punto (`.`) significa "todo lo que hay en la carpeta".

### 4.5 Crear el primer commit (guardar la primera versión)

```bash
git commit -m "v1.0.0 - Versión inicial del sitio web BPS"
```

Un **commit** es como tomar una "foto" de tu proyecto en este momento. El texto entre comillas es una descripción de qué contiene esta versión.

### 4.6 Crear la primera etiqueta de versión

```bash
git tag -a v1.0.0 -m "Versión 1.0.0 - Lanzamiento inicial del sitio web"
```

Esto marca este punto exacto como la **versión 1.0.0**. Más adelante explicamos el sistema de versiones en detalle.

### 4.7 Conectar con GitHub y subir

Reemplaza `TU-USUARIO` con tu nombre de usuario de GitHub:

```bash
git remote add origin https://github.com/TU-USUARIO/bps-website.git
git branch -M main
git push -u origin main
git push origin --tags
```

Explicación de cada línea:
- **`git remote add origin`** — Le dice a Git dónde está tu repositorio en GitHub
- **`git branch -M main`** — Renombra la rama principal a "main"
- **`git push -u origin main`** — Sube todos los archivos a GitHub
- **`git push origin --tags`** — Sube las etiquetas de versión a GitHub

Te pedirá tu usuario y contraseña de GitHub. Si te pide un "token" en vez de contraseña, sigue los pasos de la sección [Errores Comunes](#10-errores-comunes-y-soluciones).

---

## 5. Guardar Cambios (Commits)

Cada vez que hagas cambios importantes en tu proyecto, debes **guardarlos en Git**. Este proceso tiene 3 pasos:

### Paso 1: Ver qué cambió

```bash
git status
```

Este comando te muestra:
- **Archivos en rojo**: Fueron modificados pero no están preparados para guardar
- **Archivos en verde**: Están listos para guardar
- **Archivos "untracked"**: Son nuevos y Git todavía no los conoce

### Paso 2: Preparar los archivos para guardar

Para preparar **todos** los archivos modificados:

```bash
git add .
```

Para preparar un archivo específico:

```bash
git add bps-website/app/page.tsx
```

### Paso 3: Guardar los cambios (hacer commit)

```bash
git commit -m "Descripción breve de lo que cambió"
```

### Buenos ejemplos de mensajes de commit:

```bash
git commit -m "Corregir colores del navbar para mejor contraste"
git commit -m "Agregar página de términos y condiciones"
git commit -m "Actualizar preguntas del examen de práctica"
git commit -m "Corregir error en el formulario de matrícula"
```

### Malos ejemplos (evítalos):

```bash
git commit -m "cambios"           # Muy vago, no dice qué cambió
git commit -m "asdfgh"            # No tiene sentido
git commit -m "."                 # No describe nada
```

### Paso 4: Subir los cambios a GitHub

```bash
git push
```

Esto sube tus commits a GitHub para que estén guardados en la nube.

---

## 6. Crear Versiones con Tags

### ¿Qué es un Tag (Etiqueta)?

Un **tag** es una marca que le pones a un commit específico para decir: "Este es un punto importante — esta es la versión X". Es como ponerle un nombre a una foto en tu álbum.

### Sistema de Versiones (Semantic Versioning)

Las versiones se escriben con 3 números: **vMAJOR.MINOR.PATCH**

```
v1.0.0
 │ │ │
 │ │ └── PATCH: Correcciones pequeñas (errores, typos)
 │ └──── MINOR: Nuevas funciones que no rompen nada existente
 └────── MAJOR: Cambios grandes que pueden afectar cómo funciona todo
```

### Ejemplos prácticos para tu proyecto:

| Versión | Cuándo usarla | Ejemplo |
|---|---|---|
| v1.0.0 → **v1.0.1** | Corregiste un error pequeño | Arreglar un typo en la página de inicio |
| v1.0.1 → **v1.1.0** | Agregaste algo nuevo | Agregar página de "Somos" |
| v1.1.0 → **v1.2.0** | Otra función nueva | Integrar pagos con Stripe |
| v1.2.0 → **v2.0.0** | Rediseño visual completo | Cambio de estilo a tema tropical |

### Cómo crear una versión

#### Paso 1: Asegúrate de que todos los cambios están guardados

```bash
git status
```

Si hay cambios sin guardar, haz commit primero (ver sección anterior).

#### Paso 2: Crear el tag con descripción

```bash
git tag -a v1.1.0 -m "Versión 1.1.0 - Agregar página Somos y rediseño del footer"
```

- **`-a v1.1.0`** — El nombre de la versión
- **`-m "..."`** — Una descripción de qué incluye esta versión

#### Paso 3: Subir el tag a GitHub

```bash
git push origin v1.1.0
```

O para subir **todos** los tags de una vez:

```bash
git push origin --tags
```

### Ver todas las versiones

```bash
git tag
```

Esto muestra una lista como:

```
v1.0.0
v1.0.1
v1.1.0
v1.2.0
```

### Ver los detalles de una versión específica

```bash
git show v1.0.0
```

### Volver a una versión anterior (solo para ver)

```bash
git checkout v1.0.0
```

Esto te lleva "en el tiempo" a cómo estaba el proyecto en esa versión. Para volver al presente:

```bash
git checkout main
```

### Crear un Release en GitHub (versión con página bonita)

Los **Releases** son versiones que se muestran en una página especial de GitHub con descripción, notas y archivos descargables.

1. Ve a tu repositorio en GitHub
2. En la barra lateral derecha, haz clic en **"Releases"** (o ve a `https://github.com/TU-USUARIO/bps-website/releases`)
3. Haz clic en **"Create a new release"**
4. En **"Choose a tag"**, selecciona el tag que creaste (ejemplo: `v1.1.0`)
5. En **"Release title"**, escribe el nombre de la versión: `v1.1.0 - Página Somos y Rediseño`
6. En la descripción, escribe un resumen de los cambios:
   ```
   ## Cambios en esta versión
   - Agregada nueva página "Somos" (sobre nosotros)
   - Rediseño del footer con estilo tropical
   - Logos más grandes en navbar y footer
   - Corrección de contraste en links de navegación
   ```
7. Haz clic en **"Publish release"**

---

## 7. Trabajar con Ramas (Branches)

### ¿Qué es una rama?

Una **rama** es una copia independiente de tu proyecto donde puedes hacer cambios sin afectar la versión principal. Piénsalo así:

```
main (tu versión estable que funciona)
  │
  ├── feature/nuevo-diseno    ← Trabajas en el nuevo diseño aquí
  │                              Si algo sale mal, "main" no se afecta
  │
  └── fix/error-matricula     ← Corriges un error aquí
                                 Cuando está listo, lo unes a "main"
```

### Cuándo usar ramas

- **Cambios grandes**: Rediseño visual, nueva funcionalidad importante
- **Experimentos**: Quieres probar algo sin arriesgar lo que funciona
- **Correcciones**: Arreglar un error mientras trabajas en otra cosa

### Crear una nueva rama

```bash
git checkout -b feature/nombre-descriptivo
```

Ejemplos:

```bash
git checkout -b feature/nuevo-diseno-tropical
git checkout -b feature/agregar-pagina-somos
git checkout -b fix/corregir-navbar-contraste
```

### Ver en qué rama estás

```bash
git branch
```

La rama actual se marca con un asterisco (*):

```
* feature/nuevo-diseno-tropical
  main
```

### Cambiar entre ramas

```bash
git checkout main                          # Ir a la rama principal
git checkout feature/nuevo-diseno-tropical # Ir a tu rama de trabajo
```

### Subir una rama a GitHub

```bash
git push -u origin feature/nuevo-diseno-tropical
```

### Unir una rama a main (cuando los cambios están listos)

Primero, asegúrate de que todos los cambios en tu rama estén guardados (commit + push). Luego:

```bash
git checkout main                              # Ir a la rama principal
git merge feature/nuevo-diseno-tropical        # Unir los cambios
git push                                       # Subir a GitHub
```

### Eliminar una rama que ya no necesitas

Después de unirla a main, puedes borrarla:

```bash
git branch -d feature/nuevo-diseno-tropical           # Borrar local
git push origin --delete feature/nuevo-diseno-tropical # Borrar en GitHub
```

---

## 8. Flujo de Trabajo Diario

Este es el proceso recomendado para trabajar día a día:

### Antes de empezar a trabajar

```bash
cd /Users/ramonsuarez/Desktop/BPS
git status                    # Ver el estado actual
```

### Mientras trabajas

Guarda tus cambios frecuentemente (cada cambio significativo):

```bash
git add .
git commit -m "Descripción del cambio"
```

### Al terminar el día (o una sesión de trabajo)

```bash
git push                      # Subir todo a GitHub
```

### Cuando completas un hito importante

```bash
git tag -a v1.2.0 -m "Descripción de la versión"
git push origin --tags
```

### Ejemplo de un día de trabajo completo:

```bash
# 1. Empiezas a trabajar
cd /Users/ramonsuarez/Desktop/BPS

# 2. Haces cambios en el navbar
git add .
git commit -m "Mejorar contraste de colores en el navbar"

# 3. Haces cambios en el footer
git add .
git commit -m "Agregar link de panel administrativo al footer"

# 4. Corriges un error en la matrícula
git add .
git commit -m "Corregir validación de email en formulario de matrícula"

# 5. Subes todo a GitHub
git push

# 6. Como completaste varios cambios importantes, creas una versión
git tag -a v1.0.3 -m "v1.0.3 - Mejoras de navbar, footer y matrícula"
git push origin --tags
```

---

## 9. Comandos Rápidos de Referencia

### Comandos básicos

| Comando | ¿Qué hace? |
|---|---|
| `git status` | Ver qué archivos cambiaron |
| `git add .` | Preparar todos los archivos para guardar |
| `git commit -m "mensaje"` | Guardar los cambios con una descripción |
| `git push` | Subir los cambios a GitHub |
| `git pull` | Descargar cambios desde GitHub a tu computadora |
| `git log --oneline` | Ver historial de cambios (resumido) |
| `git log` | Ver historial de cambios (detallado) |

### Comandos de versiones (tags)

| Comando | ¿Qué hace? |
|---|---|
| `git tag` | Ver todas las versiones |
| `git tag -a v1.0.0 -m "desc"` | Crear nueva versión |
| `git push origin --tags` | Subir versiones a GitHub |
| `git show v1.0.0` | Ver detalles de una versión |
| `git checkout v1.0.0` | Ir temporalmente a una versión anterior |
| `git checkout main` | Volver a la versión actual |

### Comandos de ramas

| Comando | ¿Qué hace? |
|---|---|
| `git branch` | Ver todas las ramas |
| `git checkout -b nombre` | Crear nueva rama y cambiar a ella |
| `git checkout main` | Cambiar a la rama principal |
| `git merge nombre-rama` | Unir una rama a la actual |
| `git branch -d nombre` | Eliminar una rama local |

### Comandos de información

| Comando | ¿Qué hace? |
|---|---|
| `git diff` | Ver exactamente qué líneas cambiaron |
| `git log --oneline --graph` | Ver historial con gráfico de ramas |
| `git remote -v` | Ver a qué repositorio de GitHub está conectado |

---

## 10. Errores Comunes y Soluciones

### "Authentication failed" al hacer push

GitHub ya no acepta contraseñas normales. Necesitas un **Personal Access Token**:

1. Ve a [github.com/settings/tokens](https://github.com/settings/tokens)
2. Haz clic en **"Generate new token (classic)"**
3. Ponle un nombre (ejemplo: `BPS Mac`)
4. En **"Expiration"**, selecciona `No expiration` (o la duración que prefieras)
5. Marca la casilla **"repo"** (acceso completo a repositorios)
6. Haz clic en **"Generate token"**
7. **Copia el token inmediatamente** (no lo podrás ver de nuevo)
8. Cuando Git te pida la contraseña, **pega el token** en vez de tu contraseña

Para que tu Mac recuerde el token y no te lo pida cada vez:

```bash
git config --global credential.helper osxkeychain
```

### "fatal: not a git repository"

Estás en una carpeta que no tiene Git inicializado. Asegúrate de estar en la carpeta correcta:

```bash
cd /Users/ramonsuarez/Desktop/BPS
```

Si nunca inicializaste Git aquí, ejecuta `git init`.

### "Changes not staged for commit"

Hiciste cambios pero no los preparaste. Ejecuta:

```bash
git add .
```

### "Your branch is behind"

Hay cambios en GitHub que no tienes en tu computadora. Descárgalos primero:

```bash
git pull
```

### "merge conflict" (conflicto)

Esto pasa cuando tú y alguien más (o tú desde otra computadora) cambiaron las mismas líneas. Git no sabe cuál versión usar.

1. Abre el archivo que tiene conflicto
2. Busca las marcas `<<<<<<<`, `=======`, `>>>>>>>`
3. Elige cuál versión quieres mantener (o combina ambas)
4. Borra las marcas de conflicto
5. Guarda el archivo y haz commit:

```bash
git add .
git commit -m "Resolver conflicto en [nombre del archivo]"
```

### Quiero deshacer el último commit (antes de hacer push)

```bash
git reset --soft HEAD~1
```

Esto deshace el commit pero **mantiene tus cambios** en los archivos. No se pierde nada.

### Quiero descartar todos los cambios que no he guardado

**Cuidado**: Esto borra los cambios que no hayas hecho commit:

```bash
git checkout -- .
```

---

## Historial de Versiones Sugerido para BPS

Para referencia, aquí tienes un historial sugerido basado en el desarrollo que ya se ha hecho:

| Versión | Descripción |
|---|---|
| `v1.0.0` | Sitio web inicial con examen, matrícula y panel admin |
| `v1.1.0` | Integración con Supabase y Stripe |
| `v1.2.0` | Rediseño visual tropical con animaciones |
| `v1.2.1` | Correcciones de contraste y tamaño de logos |
| `v1.3.0` | GitHub Action para mantener Supabase activo |
