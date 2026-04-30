# Manual de Usuario para Administradores

Este manual explica, en lenguaje simple, cómo operar el website de BPS desde el panel de administración, qué hace cada módulo, y qué hacer cuando aparezcan errores o validaciones.

## 1) Objetivo del website

El sitio permite:

- Registrar estudiantes en el curso de navegación (matrícula).
- Cobrar la matrícula por Stripe.
- Ofrecer examen de práctica (sin guardar resultados).
- Ofrecer examen oficial (con reglas y límite de intentos).
- Emitir certificado oficial PDF para estudiantes aprobados.
- Operar todo desde un panel admin central.

---

## 2) Páginas principales del sistema

## Público (estudiantes)

- `/` Inicio
- `/somos` Información institucional
- `/matricula` Formulario de matrícula y pago
- `/practica` Examen de práctica
- `/examen` Examen oficial
- `/pago-exitoso` Confirmación después de Stripe
- `/privacidad` y `/terminos`

## Privado (administradores)

- `/admin` Panel administrativo

---

## 3) Acceso al panel admin

1. Entrar a `/admin`.
2. Escribir usuario y contraseña de administrador.
3. Si es correcto, abre el panel con pestañas.

## Mensajes frecuentes

- **“Usuario o contraseña incorrectos”**: credenciales inválidas.
- **Error 429 (muchos intentos)**: espera un momento e intenta nuevamente.

---

## 4) Pestañas del panel admin

## 4.1 Matrículas

Aquí ves las matrículas pagadas y gestionas la operación diaria.

Funciones:

- Filtrar por Mes y Año.
- Ver detalle completo de una matrícula.
- Editar campos de matrícula.
- Actualizar tracking number.
- Ver documento de identificación subido.
- Crear matrícula manual (pagada en persona).
- Abrir **Reporte DRNA** (nuevo).

## Validaciones comunes en Matrículas

- Email con formato válido.
- Teléfono con mínimo de dígitos.
- Fecha de nacimiento válida.
- Si es menor de edad, requiere firma de padre/madre/tutor.

## Errores comunes

- **No hay matrículas con filtros actuales**: revisar Mes/Año o usar “Todos”.
- **No aparece pago reciente**: usar botón “Actualizar Datos”.

---

## 4.2 Examen Oficial

Muestra historial de intentos del examen oficial.

Datos típicos:

- Nombre y email del estudiante.
- Fecha del intento.
- Porcentaje.
- Estado aprobado/reprobado.
- Datos de certificado cuando aplique.

---

## 4.3 Preguntas Falladas

Muestra las preguntas con más errores para análisis educativo.

Uso recomendado:

- Identificar temas donde más fallan.
- Ajustar explicación en clases o repasos.

---

## 4.4 Banco de Preguntas

Permite administrar preguntas del examen y sus imágenes.

Funciones:

- Ver preguntas.
- Subir imagen a pregunta.
- Eliminar imagen de pregunta.

## Validaciones comunes

- Tipos de imagen permitidos (normalmente JPG/PNG).
- Tamaño máximo de archivo.

---

## 4.5 Configuración

Controla configuración global del sitio.

Campos típicos:

- Mes y año del curso.
- Encendido/apagado de matrícula pública.
- Encendido/apagado del examen oficial público.

## Impacto importante

Si desactivas matrícula o examen oficial, se ocultan/bloquean rutas públicas correspondientes.

---

## 5) Flujo de matrícula y pago (operación real)

1. Estudiante llena formulario de `/matricula`.
2. El sistema valida datos.
3. Se crea matrícula en estado **pending**.
4. Se redirige a Stripe Checkout.
5. Si paga, la matrícula cambia a **paid** (webhook + confirmación de respaldo).
6. En admin debe aparecer en la lista de matrículas pagadas.

## Si el estudiante dice “pagué y no aparezco”

1. En admin, pulsa **Actualizar Datos**.
2. Verifica filtros Mes/Año.
3. Revisa que el estado de pago esté en `paid`.

---

## 6) Examen de práctica vs examen oficial

## Práctica

- No requiere pago.
- No guarda resultados en base de datos.
- Sirve para preparación.

## Oficial

- Requiere matrícula pagada.
- Tiene reglas:
  - Ventana de 24 horas desde matrícula.
  - Máximo 3 intentos.
  - 75 preguntas.
  - Tiempo límite.
  - Aprueba con 80% o más.
- El intento sí se guarda en base de datos.

## Errores/validaciones comunes del examen oficial

- **“No se encontró matrícula pagada…”**
- **“Periodo de 24 horas expiró…”**
- **“Máximo de 3 intentos…”**
- **Error al guardar examen** (problema de conexión o servidor).

---

## 7) Certificado oficial PDF

Se habilita cuando un estudiante aprueba examen oficial.

## Flujo

1. Estudiante aprueba.
2. Solicita certificado.
3. Sistema valida intento aprobado.
4. Genera o recupera PDF oficial.
5. Devuelve URL firmada para ver/descargar/imprimir.

## Desde admin

- Puedes abrir vista previa de certificado.
- Puedes abrir certificado asociado a un intento aprobado.

---

## 8) Reporte DRNA (Matrículas)

Disponible en pestaña **Matrículas**.

## Cómo usarlo

1. Selecciona Mes y Año (no puede estar en “Todos”).
2. Pulsa botón **Reporte DRNA**.
3. Edita encabezado del reporte.
4. Selecciona estudiantes (checkboxes).
5. Usa:
  - **Guardar**: descarga PDF.
  - **Imprimir**: imprime PDF.
  - **Cerrar Pantalla**: cierra modal.

## Reglas importantes

- Los checkboxes solo se ven en pantalla, **no salen en PDF**.
- Los campos editables del encabezado **no se guardan en base de datos**.
- El reporte usa las matrículas del mes/año filtrado.
- En “Nota”, siempre hay porcentaje:
  - Si no ha tomado examen: `0%`.
  - Si tomó examen: mejor porcentaje.
- “Días de clase” se muestra con nombres completos separados por coma.
- Guardar e Imprimir regeneran PDF para capturar la última edición.

## Mensajes comunes

- **Debe seleccionar mes y año específicos**.
- **Debe seleccionar al menos un estudiante**.

---

## 9) Errores de validación más comunes (resumen rápido)

## Matrícula

- Email inválido.
- Teléfono incompleto.
- Fecha de nacimiento inválida.
- Archivo de ID no permitido o muy grande.

## Admin

- Login incorrecto.
- Falta sesión admin (401 en endpoints protegidos).

## Stripe

- Fallo de configuración de llaves.
- Firma de webhook inválida.
- Sesión de pago no encontrada o incompleta.

## Examen oficial

- Estudiante fuera de ventana de tiempo.
- Exceso de intentos.
- Error al guardar respuestas.

## Certificados

- Intento no aprobado.
- Intento no encontrado.
- Email no autorizado para ese intento.

## DRNA

- Mes/Año no definidos.
- Ningún estudiante seleccionado.

---

## 10) Procedimiento diario recomendado para admins

1. Entrar a `/admin`.
2. Ir a **Matrículas** y revisar nuevas entradas pagadas.
3. Completar tracking numbers cuando aplique.
4. Revisar **Examen Oficial** para monitorear aprobados/reprobados.
5. Atender solicitudes de certificado desde admin si hace falta.
6. Generar **Reporte DRNA** por mes/año cuando se necesite.
7. Revisar **Preguntas Falladas** para detectar temas débiles.

---

## 11) Procedimiento cuando hay incidentes

## Caso A: “No aparece una matrícula pagada”

1. Quitar filtros o poner Mes/Año correctos.
2. Pulsar “Actualizar Datos”.
3. Verificar si el pago está en estado `paid`.

## Caso B: “No puedo entrar al examen oficial”

1. Confirmar que el email escrito sea el mismo de matrícula.
2. Confirmar que está dentro de 24h.
3. Confirmar que no agotó los 3 intentos.

## Caso C: “No sale certificado”

1. Confirmar que el intento esté aprobado.
2. Confirmar que sea intento oficial (no práctica).
3. Reintentar desde admin con el intento correcto.

## Caso D: “No guarda configuración”

1. Reintentar guardado.
2. Confirmar sesión admin activa.
3. Validar que el entorno tenga migraciones requeridas.

---

## 12) Buenas prácticas operativas

- No editar datos sin necesidad; documentar cambios manuales.
- Verificar filtros antes de concluir que “faltan datos”.
- Confirmar email exacto del estudiante en incidencias de examen/certificado.
- No compartir credenciales admin.
- Usar un navegador actualizado.
- Si hay errores intermitentes, recargar y volver a probar una sola vez antes de escalar.

---

## 13) Glosario simple

- **Matrícula pending**: registro creado, pago aún no confirmado.
- **Matrícula paid**: pago confirmado.
- **Webhook**: aviso automático de Stripe al backend.
- **URL firmada**: enlace temporal seguro para ver archivos.
- **Intento oficial**: examen oficial guardado en sistema.
- **RLS**: regla de acceso en base de datos (seguridad).

---

## 14) Alcance del manual

Este manual cubre la operación funcional del website para administradores con bajo conocimiento técnico.  
No incluye desarrollo de código ni cambios de infraestructura.