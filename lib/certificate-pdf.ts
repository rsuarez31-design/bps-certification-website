/**
 * Genera el PDF del certificado oficial (Americas Boating Course ABC template).
 * Plantilla: lib/assets/certificate-template.pdf (copia del PDF original).
 * La plantilla es un PDF portrait con el certificado dibujado en la parte
 * superior. Embebemos solo esa área como fondo en una página landscape limpia
 * y dibujamos encima los datos del estudiante.
 */

import fs from 'fs';
import path from 'path';
import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib';

const TEMPLATE_PATH = path.join(process.cwd(), 'lib/assets/certificate-template.pdf');

/** Coordenadas calibradas sobre la página original (612 x 792 pts). */
const LAYOUT = {
  /** Cubre toda la línea de placeholder debajo de "Awarded to" antes de escribir el nombre. */
  coverNameLine: { x: 170, y: 666, w: 320, h: 40 },
  /** Nombre completo centrado exactamente debajo de "Awarded to". */
  name: { centerX: 356, y: 680, size: 18, minSize: 13, maxWidth: 360 },
  /** Cubre el valor de fecha original sin borrar la línea "Date". */
  coverDate: { x: 292, y: 506, w: 130, h: 30 },
  /** Fecha DD/MM/YYYY sobre la línea "Date". */
  date: { centerX: 356, y: 514, size: 15, maxWidth: 120 },
  /** Recorte de la página para eliminar el espacio blanco inferior. */
  crop: { x: 0, y: 390, w: 612, h: 402 },
};

function toOutputY(originalY: number): number {
  return originalY - LAYOUT.crop.y;
}

export type CertificatePdfInput = {
  recipientLine: string;
  /** Ya formateado DD/MM/YYYY */
  examDateDdMmYyyy: string;
};

function fitFontSize(
  text: string,
  font: PDFFont,
  initialSize: number,
  minSize: number,
  maxWidth: number,
): number {
  let size = initialSize;
  while (size > minSize && font.widthOfTextAtSize(text, size) > maxWidth) {
    size -= 1;
  }
  return size;
}

function centeredX(
  text: string,
  font: PDFFont,
  size: number,
  centerX: number,
): number {
  return centerX - font.widthOfTextAtSize(text, size) / 2;
}

export async function generateOfficialCertificatePdfBytes(input: CertificatePdfInput): Promise<Uint8Array> {
  const templateBytes = fs.readFileSync(TEMPLATE_PATH);
  const sourceDoc = await PDFDocument.load(templateBytes);
  const sourcePage = sourceDoc.getPage(0);
  const outputDoc = await PDFDocument.create();
  const embeddedCertificate = await outputDoc.embedPage(sourcePage, {
    left: LAYOUT.crop.x,
    bottom: LAYOUT.crop.y,
    right: LAYOUT.crop.x + LAYOUT.crop.w,
    top: LAYOUT.crop.y + LAYOUT.crop.h,
  });
  const outputPage = outputDoc.addPage([LAYOUT.crop.w, LAYOUT.crop.h]);
  outputPage.drawPage(embeddedCertificate, {
    x: 0,
    y: 0,
    width: LAYOUT.crop.w,
    height: LAYOUT.crop.h,
  });

  const fontBold = await outputDoc.embedFont(StandardFonts.HelveticaBold);

  const white = rgb(1, 1, 1);
  const black = rgb(0, 0, 0);

  const name = input.recipientLine.trim().replace(/\s+/g, ' ');
  const date = input.examDateDdMmYyyy.trim();
  const nameSize = fitFontSize(
    name,
    fontBold,
    LAYOUT.name.size,
    LAYOUT.name.minSize,
    LAYOUT.name.maxWidth,
  );

  outputPage.drawRectangle({
    x: LAYOUT.coverNameLine.x,
    y: toOutputY(LAYOUT.coverNameLine.y),
    width: LAYOUT.coverNameLine.w,
    height: LAYOUT.coverNameLine.h,
    color: white,
    borderColor: white,
    borderWidth: 0,
  });
  outputPage.drawRectangle({
    x: LAYOUT.coverDate.x,
    y: toOutputY(LAYOUT.coverDate.y),
    width: LAYOUT.coverDate.w,
    height: LAYOUT.coverDate.h,
    color: white,
    borderColor: white,
    borderWidth: 0,
  });

  outputPage.drawText(name, {
    x: centeredX(name, fontBold, nameSize, LAYOUT.name.centerX),
    y: toOutputY(LAYOUT.name.y),
    size: nameSize,
    font: fontBold,
    color: black,
  });

  outputPage.drawText(date, {
    x: centeredX(date, fontBold, LAYOUT.date.size, LAYOUT.date.centerX),
    y: toOutputY(LAYOUT.date.y),
    size: LAYOUT.date.size,
    font: fontBold,
    color: black,
  });

  return outputDoc.save();
}
