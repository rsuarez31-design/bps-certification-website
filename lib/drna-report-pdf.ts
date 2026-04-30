/**
 * Generador del Reporte DRNA en PDF landscape.
 * Replica el formato del reporte oficial del DRNA usado por Boqueron Power Squadron:
 * encabezado con datos de la institución, tabla de estudiantes y bloque de firma final.
 */

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';

export type DrnaStudentRow = {
  apellidos: string;
  nombreInicial: string;
  fechaNacimiento: string;
  direccionFisica: string;
  direccionPostal: string;
  firmaEstudiante: string;
  nota: string;
};

export type DrnaReportInput = {
  fechaCurso: string;
  fechaExamen: string;
  fechaConferencia: string;
  numeroEstudiantes: string;
  numeroEstudiantesCompletaron: string;
  personaACargo: string;
  telefonoContacto: string;
  diasClase: { lunes: boolean; martes: boolean; miercoles: boolean; jueves: boolean; viernes: boolean; sabado: boolean; domingo: boolean };
  horario: string;
  direccionFisicaCurso: string;
  lugar: string;
  institucion: string;
  pieReporte: string;
  estudiantes: DrnaStudentRow[];
};

const PAGE_W = 792;
const PAGE_H = 612;
const MARGIN_X = 28;
const MARGIN_Y = 28;
const NAVY = rgb(0.07, 0.18, 0.4);
const NAVY_LIGHT = rgb(0.85, 0.9, 0.97);
const BLACK = rgb(0, 0, 0);
const GRAY = rgb(0.55, 0.55, 0.55);

const STUDENT_ROW_HEIGHT = 30;
const STUDENT_TABLE_HEADER_HEIGHT = 22;
const HEADER_BLOCK_HEIGHT = 196;
const FOOTER_BLOCK_HEIGHT = 70;

function safe(value: string | null | undefined): string {
  return (value ?? '').toString();
}

function widthForText(font: PDFFont, text: string, size: number): number {
  return font.widthOfTextAtSize(text, size);
}

function drawText(page: PDFPage, text: string, x: number, y: number, font: PDFFont, size: number, color = BLACK) {
  if (!text) return;
  page.drawText(text, { x, y, size, font, color });
}

function drawWrappedText(page: PDFPage, text: string, x: number, y: number, maxWidth: number, font: PDFFont, size: number, lineHeight = 10, maxLines = 2) {
  if (!text) return;
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (widthForText(font, candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  for (let i = 0; i < lines.length; i += 1) {
    drawText(page, lines[i], x, y - i * lineHeight, font, size);
  }
}

function drawHeaderBlock(
  page: PDFPage,
  fonts: { regular: PDFFont; bold: PDFFont },
  data: DrnaReportInput,
  pageInfo: { current: number; total: number },
) {
  const top = PAGE_H - MARGIN_Y;
  let y = top;

  drawText(page, `Página ${pageInfo.current}/${pageInfo.total}`, PAGE_W - MARGIN_X - 60, top + 4, fonts.regular, 8, GRAY);

  const titleHeight = 18;
  page.drawRectangle({
    x: MARGIN_X,
    y: y - titleHeight,
    width: PAGE_W - MARGIN_X * 2,
    height: titleHeight,
    color: NAVY_LIGHT,
    borderColor: NAVY,
    borderWidth: 0.7,
  });
  drawText(page, 'INFORMACIÓN DE LA INSTITUCIÓN', MARGIN_X + 6, y - 13, fonts.bold, 11, BLACK);
  y -= titleHeight;

  const fieldHeight = 22;
  const innerLeft = MARGIN_X;
  const innerRight = PAGE_W - MARGIN_X;
  const totalInner = innerRight - innerLeft;

  // Row 1: Institucion + Lugar
  page.drawRectangle({ x: innerLeft, y: y - fieldHeight, width: totalInner, height: fieldHeight, borderColor: NAVY, borderWidth: 0.5 });
  page.drawLine({ start: { x: innerLeft + totalInner * 0.62, y: y - fieldHeight }, end: { x: innerLeft + totalInner * 0.62, y }, color: NAVY, thickness: 0.5 });
  drawText(page, safe(data.institucion).toUpperCase(), innerLeft + 6, y - 14, fonts.bold, 10);
  drawText(page, 'LUGAR:', innerLeft + totalInner * 0.62 + 6, y - 9, fonts.regular, 8, BLACK);
  drawText(page, safe(data.lugar), innerLeft + totalInner * 0.62 + 38, y - 14, fonts.bold, 10);
  y -= fieldHeight;

  // Row 2: Fecha curso | Fecha examen
  page.drawRectangle({ x: innerLeft, y: y - fieldHeight, width: totalInner, height: fieldHeight, borderColor: NAVY, borderWidth: 0.5 });
  page.drawLine({ start: { x: innerLeft + totalInner * 0.5, y: y - fieldHeight }, end: { x: innerLeft + totalInner * 0.5, y }, color: NAVY, thickness: 0.5 });
  drawText(page, 'FECHA DEL CURSO:', innerLeft + 6, y - 9, fonts.regular, 8, BLACK);
  drawText(page, safe(data.fechaCurso), innerLeft + 96, y - 14, fonts.bold, 10);
  drawText(page, 'FECHA DEL EXAMEN:', innerLeft + totalInner * 0.5 + 6, y - 9, fonts.regular, 8, BLACK);
  drawText(page, safe(data.fechaExamen), innerLeft + totalInner * 0.5 + 102, y - 14, fonts.bold, 10);
  y -= fieldHeight;

  // Row 3: Dias de clase | Horario | Fecha conferencia
  page.drawRectangle({ x: innerLeft, y: y - fieldHeight, width: totalInner, height: fieldHeight, borderColor: NAVY, borderWidth: 0.5 });
  const x1 = innerLeft + totalInner * 0.5;
  const x2 = innerLeft + totalInner * 0.7;
  page.drawLine({ start: { x: x1, y: y - fieldHeight }, end: { x: x1, y }, color: NAVY, thickness: 0.5 });
  page.drawLine({ start: { x: x2, y: y - fieldHeight }, end: { x: x2, y }, color: NAVY, thickness: 0.5 });
  drawText(page, 'DÍAS DE CLASE:', innerLeft + 6, y - 9, fonts.regular, 8, BLACK);
  const diasFull = [
    { name: 'Lunes', selected: data.diasClase.lunes },
    { name: 'Martes', selected: data.diasClase.martes },
    { name: 'Miércoles', selected: data.diasClase.miercoles },
    { name: 'Jueves', selected: data.diasClase.jueves },
    { name: 'Viernes', selected: data.diasClase.viernes },
    { name: 'Sábado', selected: data.diasClase.sabado },
    { name: 'Domingo', selected: data.diasClase.domingo },
  ]
    .filter((d) => d.selected)
    .map((d) => d.name)
    .join(', ');
  drawText(page, diasFull, innerLeft + 88, y - 14, fonts.bold, 10);
  drawText(page, 'HORARIO:', x1 + 6, y - 9, fonts.regular, 8, BLACK);
  drawText(page, safe(data.horario), x1 + 50, y - 14, fonts.bold, 10);
  drawText(page, 'CONFERENCIA 430:', x2 + 6, y - 9, fonts.regular, 8, BLACK);
  drawText(page, safe(data.fechaConferencia), x2 + 96, y - 14, fonts.bold, 10);
  y -= fieldHeight;

  // Row 4: Direccion fisica del curso (full width)
  page.drawRectangle({ x: innerLeft, y: y - fieldHeight, width: totalInner, height: fieldHeight, borderColor: NAVY, borderWidth: 0.5 });
  drawText(page, 'DIRECCIÓN FÍSICA DEL CURSO:', innerLeft + 6, y - 9, fonts.regular, 8, BLACK);
  drawText(page, safe(data.direccionFisicaCurso), innerLeft + 156, y - 14, fonts.bold, 10);
  y -= fieldHeight;

  // Row 5: Numero estudiantes | Numero completaron
  page.drawRectangle({ x: innerLeft, y: y - fieldHeight, width: totalInner, height: fieldHeight, borderColor: NAVY, borderWidth: 0.5 });
  page.drawLine({ start: { x: innerLeft + totalInner * 0.5, y: y - fieldHeight }, end: { x: innerLeft + totalInner * 0.5, y }, color: NAVY, thickness: 0.5 });
  drawText(page, 'NÚMERO DE ESTUDIANTES (BOATING):', innerLeft + 6, y - 9, fonts.regular, 8, BLACK);
  drawText(page, safe(data.numeroEstudiantes), innerLeft + 196, y - 14, fonts.bold, 10);
  drawText(page, 'NÚMERO DE ESTUDIANTES QUE COMPLETARON EL CURSO:', innerLeft + totalInner * 0.5 + 6, y - 9, fonts.regular, 8, BLACK);
  drawText(page, safe(data.numeroEstudiantesCompletaron), innerLeft + totalInner * 0.5 + 286, y - 14, fonts.bold, 10);
  y -= fieldHeight;

  // Row 6: Persona a cargo | Firma | Telefono
  page.drawRectangle({ x: innerLeft, y: y - fieldHeight, width: totalInner, height: fieldHeight, borderColor: NAVY, borderWidth: 0.5 });
  const px1 = innerLeft + totalInner * 0.45;
  const px2 = innerLeft + totalInner * 0.78;
  page.drawLine({ start: { x: px1, y: y - fieldHeight }, end: { x: px1, y }, color: NAVY, thickness: 0.5 });
  page.drawLine({ start: { x: px2, y: y - fieldHeight }, end: { x: px2, y }, color: NAVY, thickness: 0.5 });
  drawText(page, 'PERSONA A CARGO DEL EXAMEN:', innerLeft + 6, y - 9, fonts.regular, 8, BLACK);
  drawText(page, safe(data.personaACargo), innerLeft + 168, y - 14, fonts.bold, 10);
  drawText(page, 'FIRMA:', px1 + 6, y - 9, fonts.regular, 8, BLACK);
  page.drawLine({ start: { x: px1 + 38, y: y - 16 }, end: { x: px2 - 6, y: y - 16 }, color: BLACK, thickness: 0.6 });
  drawText(page, 'TELÉFONO:', px2 + 6, y - 9, fonts.regular, 8, BLACK);
  drawText(page, safe(data.telefonoContacto), px2 + 60, y - 14, fonts.bold, 10);
  y -= fieldHeight;
}

function drawStudentsHeader(page: PDFPage, fonts: { regular: PDFFont; bold: PDFFont }, columns: { label: string; x: number; w: number }[], y: number) {
  const left = MARGIN_X;
  const right = PAGE_W - MARGIN_X;
  const titleHeight = 16;
  page.drawRectangle({
    x: left,
    y: y - titleHeight,
    width: right - left,
    height: titleHeight,
    color: NAVY_LIGHT,
    borderColor: NAVY,
    borderWidth: 0.7,
  });
  drawText(page, 'INFORMACIÓN DE LOS ESTUDIANTES', left + 6, y - 12, fonts.bold, 10, BLACK);
  y -= titleHeight;

  page.drawRectangle({
    x: left,
    y: y - STUDENT_TABLE_HEADER_HEIGHT,
    width: right - left,
    height: STUDENT_TABLE_HEADER_HEIGHT,
    color: NAVY,
    borderColor: NAVY,
    borderWidth: 0.5,
  });
  for (const col of columns) {
    drawText(page, col.label, col.x + 4, y - 14, fonts.bold, 9, rgb(1, 1, 1));
  }
  return y - STUDENT_TABLE_HEADER_HEIGHT;
}

function drawStudentRow(
  page: PDFPage,
  fonts: { regular: PDFFont; bold: PDFFont; signature: PDFFont },
  columns: { key: keyof DrnaStudentRow | 'apellidosNombre'; x: number; w: number }[],
  row: DrnaStudentRow,
  y: number,
) {
  const left = MARGIN_X;
  const right = PAGE_W - MARGIN_X;

  page.drawRectangle({
    x: left,
    y: y - STUDENT_ROW_HEIGHT,
    width: right - left,
    height: STUDENT_ROW_HEIGHT,
    borderColor: NAVY,
    borderWidth: 0.4,
  });

  for (let i = 1; i < columns.length; i += 1) {
    const col = columns[i];
    page.drawLine({ start: { x: col.x, y: y - STUDENT_ROW_HEIGHT }, end: { x: col.x, y }, color: NAVY, thickness: 0.4 });
  }

  const ROW_FONT_SIZE = 9;
  for (const col of columns) {
    let text = '';
    if (col.key === 'apellidosNombre') {
      text = `${row.apellidos}${row.nombreInicial ? `, ${row.nombreInicial}` : ''}`;
    } else {
      text = safe(row[col.key]);
    }
    if (col.key === 'firmaEstudiante') {
      drawText(page, text, col.x + 4, y - 14, fonts.signature, ROW_FONT_SIZE);
    } else if (col.key === 'nota') {
      const w = widthForText(fonts.bold, text, ROW_FONT_SIZE);
      drawText(page, text, col.x + col.w / 2 - w / 2, y - 14, fonts.bold, ROW_FONT_SIZE);
    } else {
      drawWrappedText(page, text, col.x + 4, y - 12, col.w - 8, fonts.regular, ROW_FONT_SIZE, 11, 2);
    }
  }
}

function drawFooterBlock(
  page: PDFPage,
  fonts: { regular: PDFFont; bold: PDFFont },
  data: DrnaReportInput,
) {
  const y = MARGIN_Y;
  drawText(page, safe(data.institucion), MARGIN_X, y + 24, fonts.regular, 9, GRAY);
  drawText(page, safe(data.pieReporte), MARGIN_X, y + 12, fonts.regular, 9, GRAY);

  const lineX1 = PAGE_W - MARGIN_X - 220;
  const lineX2 = PAGE_W - MARGIN_X - 10;
  page.drawLine({ start: { x: lineX1, y: y + 24 }, end: { x: lineX2, y: y + 24 }, color: BLACK, thickness: 0.8 });
  const label = 'FIRMA DEL ENCARGADO';
  const w = widthForText(fonts.regular, label, 9);
  drawText(page, label, lineX1 + ((lineX2 - lineX1) - w) / 2, y + 12, fonts.regular, 9, GRAY);
}

export async function generateDrnaReportPdfBytes(input: DrnaReportInput): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontSignature = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Layout columns for student table.
  const tableLeft = MARGIN_X;
  const tableRight = PAGE_W - MARGIN_X;
  const tableWidth = tableRight - tableLeft;
  const colWeights = [
    { key: 'apellidosNombre' as const, label: 'APELLIDOS, NOMBRE INICIAL', w: 0.2 },
    { key: 'fechaNacimiento' as const, label: 'FECHA DE NACIMIENTO', w: 0.13 },
    { key: 'direccionFisica' as const, label: 'DIRECCIÓN FÍSICA', w: 0.22 },
    { key: 'direccionPostal' as const, label: 'DIRECCIÓN POSTAL', w: 0.18 },
    { key: 'firmaEstudiante' as const, label: 'FIRMA DEL ESTUDIANTE', w: 0.2 },
    { key: 'nota' as const, label: 'NOTA', w: 0.07 },
  ];
  let runningX = tableLeft;
  const columns = colWeights.map((c) => {
    const width = tableWidth * c.w;
    const col = { ...c, x: runningX, w: width };
    runningX += width;
    return col;
  });

  const headerColumns = columns.map((c) => ({ label: c.label, x: c.x, w: c.w }));
  const rowColumns = columns.map((c) => ({ key: c.key, x: c.x, w: c.w }));

  const usableHeight = PAGE_H - MARGIN_Y * 2 - HEADER_BLOCK_HEIGHT - STUDENT_TABLE_HEADER_HEIGHT - 16 - FOOTER_BLOCK_HEIGHT;
  const studentsPerPage = Math.max(1, Math.floor(usableHeight / STUDENT_ROW_HEIGHT));
  const totalPages = Math.max(1, Math.ceil(input.estudiantes.length / studentsPerPage));

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx += 1) {
    const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    drawHeaderBlock(page, { regular: fontRegular, bold: fontBold }, input, { current: pageIdx + 1, total: totalPages });

    const tableTop = PAGE_H - MARGIN_Y - HEADER_BLOCK_HEIGHT;
    let y = drawStudentsHeader(page, { regular: fontRegular, bold: fontBold }, headerColumns, tableTop);

    const start = pageIdx * studentsPerPage;
    const end = Math.min(start + studentsPerPage, input.estudiantes.length);
    for (let i = start; i < end; i += 1) {
      const row = input.estudiantes[i];
      drawStudentRow(page, { regular: fontRegular, bold: fontBold, signature: fontSignature }, rowColumns, row, y);
      y -= STUDENT_ROW_HEIGHT;
    }

    drawFooterBlock(page, { regular: fontRegular, bold: fontBold }, input);
  }

  return pdfDoc.save();
}
