# 🚀 INSTRUCCIONES RÁPIDAS - BPS Website

## ¿Primera vez con Node.js?

### PASO 1: Instalar Node.js
1. Ve a [https://nodejs.org/](https://nodejs.org/)
2. Descarga la versión LTS (la recomendada)
3. Abre el archivo descargado y sigue el instalador
4. Cuando termine, abre Terminal y verifica:
   ```bash
   node --version
   ```
   Deberías ver algo como: `v20.11.0`

---

## PASO 2: Ejecutar el Proyecto

### Opción A: Usando Terminal (Recomendado)

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
   ⏱️ Esto puede tardar 2-3 minutos. ¡Es normal!

4. **Iniciar el servidor:**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador:**
   - Abre tu navegador
   - Ve a: `http://localhost:3000`

---

## PASO 3: Explorar el Sitio

### Páginas Disponibles:
- **Inicio:** `http://localhost:3000`
- **Matrícula:** `http://localhost:3000/matricula`
- **Examen:** `http://localhost:3000/examen`
- **Admin:** `http://localhost:3000/admin` (Usuario: BPS, Contraseña: 2026)

---

## ❓ ¿Problemas?

### "npm: command not found"
→ Node.js no está instalado. Vuelve al PASO 1.

### "Port 3000 is already in use"
→ Ya tienes algo corriendo en ese puerto. Ciérralo o usa:
```bash
npm run dev -- --port 3001
```

### "Permission denied"
→ Intenta con:
```bash
sudo npm install
```
(Te pedirá tu contraseña de Mac)

---

## 🛑 Detener el Servidor

En la Terminal donde está corriendo, presiona:
```
Ctrl + C
```

---

## 📝 Archivos Importantes

- `app/page.tsx` - Página principal
- `data/examQuestions.ts` - Las 85 preguntas del examen
- `app/matricula/page.tsx` - Formulario de inscripción
- `app/examen/page.tsx` - Sistema de examen
- `app/admin/page.tsx` - Panel administrativo

---

## 💡 Próximos Pasos

1. ✅ Ejecutar el proyecto
2. ✅ Explorar todas las páginas
3. ✅ Tomar el examen de práctica
4. ✅ Ver el panel administrativo
5. ✅ Personalizar textos y colores según necesites

---

**¿Necesitas ayuda?** Lee el archivo `README.md` completo para más detalles.

**¡Éxito con tu proyecto! ⚓🌊**
