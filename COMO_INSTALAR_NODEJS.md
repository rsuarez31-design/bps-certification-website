# 📥 CÓMO INSTALAR NODE.JS EN macOS
## Guía Paso a Paso con Imágenes Descriptivas

---

## ⚡ MÉTODO 1: INSTALACIÓN DIRECTA (RECOMENDADO PARA PRINCIPIANTES)

Este es el método más fácil y no requiere conocimientos técnicos.

### Paso 1: Descargar Node.js

1. **Abre tu navegador** (Safari, Chrome, Firefox, etc.)

2. **Ve a la página oficial de Node.js:**
   ```
   https://nodejs.org/
   ```

3. **Verás dos botones de descarga:**
   - **LTS (Long Term Support)** ← ESTE ES EL QUE NECESITAS ✅
   - Current (Latest Features) ← No uses este

4. **Haz clic en el botón verde de "LTS"**
   - Descargará un archivo `.pkg` automáticamente
   - El archivo se llama algo como: `node-v20.11.0.pkg`

### Paso 2: Instalar Node.js

1. **Abre la carpeta de Descargas:**
   - Finder → Descargas
   - O presiona `Cmd + Opción + L`

2. **Haz doble clic en el archivo `.pkg` descargado**
   - Se abrirá el instalador de Node.js

3. **Sigue el instalador:**
   
   **Pantalla 1: Introducción**
   - Lee la información
   - Haz clic en **"Continuar"**

   **Pantalla 2: Licencia**
   - Lee (o no 😉) la licencia
   - Haz clic en **"Continuar"**
   - Haz clic en **"Aceptar"**

   **Pantalla 3: Tipo de Instalación**
   - Deja las opciones por defecto
   - Haz clic en **"Instalar"**

   **Pantalla 4: Autenticación**
   - Te pedirá tu contraseña de Mac
   - Ingresa tu contraseña
   - Haz clic en **"Instalar software"**

   **Pantalla 5: Instalación**
   - Espera a que termine (1-2 minutos)
   - Verás una barra de progreso

   **Pantalla 6: Finalización**
   - Dice: "La instalación se completó correctamente"
   - Haz clic en **"Cerrar"**

4. **¿Mover el instalador a la papelera?**
   - Puedes hacer clic en **"Mover a la papelera"**
   - Ya no lo necesitas

### Paso 3: Verificar la Instalación

1. **Abre Terminal:**
   - Presiona `Cmd + Espacio`
   - Escribe "Terminal"
   - Presiona `Enter`

2. **Verifica Node.js:**
   - En la Terminal, escribe:
   ```bash
   node --version
   ```
   - Presiona `Enter`
   - Deberías ver algo como: `v20.11.0`

3. **Verifica npm:**
   - En la Terminal, escribe:
   ```bash
   npm --version
   ```
   - Presiona `Enter`
   - Deberías ver algo como: `10.2.4`

4. **✅ Si ves ambas versiones, ¡ÉXITO!**
   - Node.js está instalado correctamente
   - Ya puedes ejecutar el proyecto

---

## ⚙️ MÉTODO 2: USANDO HOMEBREW (PARA USUARIOS AVANZADOS)

Solo usa este método si ya tienes Homebrew instalado.

### Si ya tienes Homebrew:

```bash
brew install node
```

### Si NO tienes Homebrew:

1. **Instala Homebrew primero:**
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Luego instala Node.js:**
   ```bash
   brew install node
   ```

**Nota:** Este método requiere permisos de administrador.

---

## ❓ SOLUCIÓN DE PROBLEMAS

### Problema 1: "No se puede abrir porque es de un desarrollador no identificado"

**Solución:**
1. Ve a **Preferencias del Sistema** → **Seguridad y Privacidad**
2. En la pestaña **General**, verás un mensaje sobre el archivo
3. Haz clic en **"Abrir de todas formas"**
4. Confirma haciendo clic en **"Abrir"**

### Problema 2: "command not found: node" después de instalar

**Solución:**
1. **Cierra la Terminal completamente**
2. **Abre una NUEVA Terminal**
3. **Intenta de nuevo:**
   ```bash
   node --version
   ```

Si aún no funciona:
1. **Reinicia tu Mac**
2. **Abre Terminal de nuevo**
3. **Verifica la instalación**

### Problema 3: No tengo permisos de administrador

**Solución:**
- Pide a un administrador de la Mac que ingrese su contraseña
- O usa una Mac donde tengas permisos de administrador

---

## 🎯 DESPUÉS DE INSTALAR NODE.JS

### Ya puedes ejecutar el proyecto BPS:

1. **Abre Terminal**

2. **Ve al directorio del proyecto:**
   ```bash
   cd /Users/ramonsuarez/Desktop/BPS/bps-website
   ```

3. **Instala las dependencias:**
   ```bash
   npm install
   ```
   ⏱️ Esto puede tardar 2-3 minutos la primera vez

4. **Inicia el servidor:**
   ```bash
   npm run dev
   ```

5. **Abre tu navegador:**
   - Ve a: `http://localhost:3000`

---

## 📚 VERIFICACIONES FINALES

Antes de empezar con el proyecto, verifica que todo esté listo:

### ✅ Checklist:

- [ ] Node.js instalado (verifica con `node --version`)
- [ ] npm instalado (verifica con `npm --version`)
- [ ] Puedes abrir Terminal sin problemas
- [ ] Conoces la ubicación del proyecto
- [ ] Tienes conexión a internet (para npm install)

---

## 🆘 ¿AÚN TIENES PROBLEMAS?

### Opción 1: Reiniciar el Proceso
1. Desinstala Node.js:
   - Ve a `/usr/local/lib` y elimina carpeta `node_modules`
   - Ve a `/usr/local/bin` y elimina `node` y `npm`
2. Reinicia tu Mac
3. Instala de nuevo siguiendo el Método 1

### Opción 2: Usar nvm (Node Version Manager)
Es una herramienta para instalar y gestionar versiones de Node.js:

```bash
# Instalar nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Reiniciar Terminal

# Instalar Node.js con nvm
nvm install --lts

# Verificar
node --version
```

---

## 🎓 RECURSOS ADICIONALES

### Videos Tutoriales (YouTube):
Busca: "Cómo instalar Node.js en Mac" - Hay muchos videos en español

### Documentación Oficial:
- Node.js: https://nodejs.org/docs/
- npm: https://docs.npmjs.com/

### Comunidades de Ayuda:
- Stack Overflow (en español): https://es.stackoverflow.com/
- Reddit: r/learnprogramming
- Discord de desarrollo web

---

## 💡 CONSEJOS FINALES

1. **No te frustres** - Es normal tener problemas la primera vez
2. **Lee los mensajes de error** - Suelen decir qué está mal
3. **Google es tu amigo** - Copia el error y búscalo en Google
4. **Pide ayuda** - La comunidad de desarrolladores es muy amigable
5. **Practica** - Mientras más uses Terminal, más fácil se vuelve

---

## 🎉 PRÓXIMOS PASOS

Una vez que Node.js esté instalado:

1. ✅ Lee `INSTRUCCIONES_RAPIDAS.md`
2. ✅ Lee `RESUMEN_DEL_PROYECTO.md`
3. ✅ Ejecuta el proyecto con `npm run dev`
4. ✅ Explora todas las páginas
5. ✅ Disfruta de tu nuevo sitio web

---

**¡Éxito con la instalación! 🚀**

---

## 📞 INFORMACIÓN DEL PROYECTO

**Americas Boating Club - Boqueron Power Squadron**
Sistema de Certificación de Navegación - Ley 430 PR

Ubicación del proyecto:
```
/Users/ramonsuarez/Desktop/BPS/bps-website
```

---

*Si después de intentar todo esto aún no funciona, contacta a un desarrollador local o a soporte técnico de Apple.*
