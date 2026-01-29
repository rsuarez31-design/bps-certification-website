# Americas Boating Club - Boqueron Power Squadron
## Sistema de Certificación de Navegación - Ley 430 PR

Este es un sitio web completo para la certificación oficial de navegantes bajo la Ley 430 de Puerto Rico.

---

## 🚀 Características Principales

✅ **Landing Page Profesional** - Diseño náutico moderno con información sobre la Ley 430  
✅ **Matrícula Digital** - Formulario completo de inscripción en línea  
✅ **Sistema de Examen Inteligente** - 75 preguntas aleatorias de un banco de 85  
✅ **Sistema de Ayuda Automático** - Pistas cuando el estudiante falla más de 8 preguntas  
✅ **Certificado Digital** - Generación automática al aprobar con confeti animado  
✅ **Panel Administrativo** - Dashboard con estadísticas y historial completo  

---

## 📋 Requisitos Previos

Antes de comenzar, necesitas tener instalado:

1. **Node.js** (versión 18 o superior)
2. **npm** (viene incluido con Node.js)

---

## 🛠️ Instalación de Node.js en macOS

### Opción 1: Instalar Node.js directamente (Recomendado para principiantes)

1. Visita [https://nodejs.org/](https://nodejs.org/)
2. Descarga la versión LTS (Long Term Support) - actualmente v18 o v20
3. Abre el archivo descargado (.pkg) y sigue las instrucciones de instalación
4. Verifica la instalación abriendo Terminal y ejecutando:
   ```bash
   node --version
   npm --version
   ```

### Opción 2: Usando Homebrew (Requiere permisos de administrador)

Si tienes Homebrew instalado, puedes ejecutar:
```bash
brew install node
```

---

## 🚀 Cómo Ejecutar el Proyecto

Sigue estos pasos en orden:

### 1. Abrir Terminal
- Presiona `Cmd + Espacio`
- Escribe "Terminal"
- Presiona Enter

### 2. Navegar al Directorio del Proyecto
```bash
cd /Users/ramonsuarez/Desktop/BPS/bps-website
```

### 3. Instalar las Dependencias
Este comando descargará e instalará todas las librerías necesarias (puede tardar unos minutos):
```bash
npm install
```

### 4. Ejecutar el Servidor de Desarrollo
```bash
npm run dev
```

### 5. Abrir en el Navegador
- El servidor estará corriendo en: **http://localhost:3000**
- Abre tu navegador favorito (Chrome, Safari, Firefox, etc.)
- Visita: `http://localhost:3000`

---

## 📁 Estructura del Proyecto

```
bps-website/
├── app/                        # Páginas de la aplicación
│   ├── page.tsx               # Página principal (landing page)
│   ├── layout.tsx             # Layout principal con navbar y footer
│   ├── globals.css            # Estilos globales
│   ├── matricula/             # Página de matrícula
│   │   └── page.tsx
│   ├── examen/                # Página del examen
│   │   └── page.tsx
│   └── admin/                 # Panel administrativo
│       └── page.tsx
├── components/                 # Componentes reutilizables
│   ├── Navbar.tsx             # Barra de navegación
│   ├── Footer.tsx             # Pie de página
│   ├── ExamQuestion.tsx       # Componente de pregunta del examen
│   ├── ExamProgress.tsx       # Barra de progreso del examen
│   └── ExamResults.tsx        # Resultados y certificado
├── data/                       # Datos de la aplicación
│   └── examQuestions.ts       # 85 preguntas del examen
├── public/                     # Archivos públicos
│   └── images/                # Imágenes (logo, etc.)
│       └── bps-logo.png
├── package.json               # Dependencias del proyecto
├── tsconfig.json              # Configuración de TypeScript
├── tailwind.config.ts         # Configuración de Tailwind CSS
└── README.md                  # Este archivo

```

---

## 🎨 Tecnologías Utilizadas

- **Next.js 14** - Framework de React con App Router
- **TypeScript** - Para código más seguro y mantenible
- **Tailwind CSS** - Para estilos modernos y responsivos
- **Lucide React** - Iconos modernos
- **Canvas Confetti** - Animación de confeti al aprobar

---

## 🔐 Credenciales del Panel Administrativo

Para acceder al panel administrativo (`/admin`):
- **Usuario:** BPS
- **Contraseña:** 2026

---

## 📊 Funcionalidades Detalladas

### Landing Page
- Hero section impactante con llamada a la acción
- Información completa sobre la Ley 430
- Descripción de características del curso

### Matrícula Digital
- Formulario organizado en secciones:
  - Información Personal
  - Características Físicas
  - Información de la Embarcación
  - Información Adicional
- Validación de campos obligatorios
- Guardado automático en localStorage

### Sistema de Examen
- Selección aleatoria de 75 preguntas de 85
- Navegación entre preguntas (Anterior/Siguiente)
- Guardado automático de respuestas
- Barra de progreso visual
- Sistema de ayuda (hints) que se activa tras 8 errores
- Calificación automática (80% para aprobar)
- Certificado digital con confeti si aprueba
- Revisión detallada de todas las respuestas

### Panel Administrativo
- Protección con usuario y contraseña
- Tarjetas de estadísticas:
  - Total de estudiantes inscritos
  - Exámenes completados
  - Tasa de aprobación
  - Aprobados vs. Reprobados
- Lista de preguntas más falladas
- Historial completo de exámenes
- Lista de estudiantes inscritos

---

## 🐛 Solución de Problemas Comunes

### Error: "command not found: npm"
- Node.js no está instalado correctamente
- Solución: Reinstala Node.js siguiendo las instrucciones anteriores

### Error: "port 3000 is already in use"
- El puerto 3000 está ocupado por otra aplicación
- Solución: Cierra otros servidores o usa otro puerto:
  ```bash
  npm run dev -- --port 3001
  ```

### La página no carga o muestra errores
1. Asegúrate de estar en el directorio correcto
2. Verifica que todos los archivos estén presentes
3. Intenta eliminar node_modules e reinstalar:
   ```bash
   rm -rf node_modules
   npm install
   ```

---

## 📝 Notas para Desarrollo

### Comentarios en el Código
- Todo el código incluye comentarios detallados en español
- Los comentarios explican qué hace cada sección
- Ideal para aprender cómo funciona cada parte

### Almacenamiento de Datos
- Los datos se guardan en `localStorage` del navegador
- En producción, deberías usar una base de datos real (PostgreSQL, MongoDB, etc.)
- Las respuestas del examen y matrículas persisten entre sesiones

### Personalización
- Colores: Edita `tailwind.config.ts`
- Preguntas: Modifica `data/examQuestions.ts`
- Textos: Edita los archivos `.tsx` en `app/`

---

## 🚢 Próximos Pasos para Producción

Para llevar este proyecto a producción, considera:

1. **Base de Datos**
   - Implementar PostgreSQL o MongoDB
   - Almacenar estudiantes, exámenes y resultados

2. **Autenticación Real**
   - Usar NextAuth.js o similar
   - Hash de contraseñas con bcrypt

3. **API Backend**
   - Crear API routes en Next.js
   - Validación del lado del servidor

4. **Envío de Emails**
   - Confirmación de matrícula
   - Envío del certificado por email

5. **Hosting**
   - Vercel (gratis y fácil para Next.js)
   - AWS, Google Cloud, o DigitalOcean

6. **Dominio**
   - Registrar dominio personalizado
   - Configurar SSL/HTTPS

---

## 📞 Soporte

Para preguntas o problemas:
- Email: info@boqueron-squadron.org
- Teléfono: (787) 123-4567

---

## 📄 Licencia

© 2026 Americas Boating Club - Boqueron Power Squadron. Todos los derechos reservados.

---

## 🎓 Recursos de Aprendizaje

Si eres principiante y quieres aprender más:

- [Next.js Documentación](https://nextjs.org/docs)
- [React Documentación](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript para Principiantes](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html)

---

**¡Bienvenido al mundo del desarrollo web! 🌊⚓**
