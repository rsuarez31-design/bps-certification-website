export type StudentEmailIdentity = {
  fullName: string;
  lastName?: string | null;
};

function studentDisplayName(student: StudentEmailIdentity): string {
  const name = `${student.fullName || ''} ${student.lastName || ''}`.trim();
  return name || 'estudiante';
}

function baseHtml(title: string, body: string): string {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f8fb;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f8fb;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="background:#0b1f3a;color:#ffffff;padding:22px 28px;">
                <h1 style="margin:0;font-size:22px;line-height:1.3;">Boquerón Power Squadron</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;font-size:16px;line-height:1.65;">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px;background:#f9fafb;color:#4b5563;font-size:13px;line-height:1.5;">
                Este mensaje fue enviado automáticamente por Boquerón Power Squadron.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildWelcomeEmail(student: StudentEmailIdentity): {
  subject: string;
  html: string;
  text: string;
} {
  const name = studentDisplayName(student);
  const subject = 'Bienvenido al curso de navegación de Boquerón Power Squadron';
  const text = `Saludos ${name},

Gracias por matricularte en el curso de navegación ofrecido por Boquerón Power Squadron. Nos alegra mucho contar con tu participación en esta experiencia educativa.

Próximamente, el personal de Boquerón Power Squadron se estará comunicando contigo para ofrecerte más detalles sobre el itinerario del curso, las fechas, los requisitos y cualquier información adicional que necesites para prepararte adecuadamente.

Te invitamos a participar activamente, hacer preguntas y aprovechar al máximo este curso. Nuestro objetivo es apoyarte para que desarrolles conocimientos importantes de seguridad, responsabilidad y buenas prácticas de navegación.

Cordialmente,
Boquerón Power Squadron`;

  const html = baseHtml(
    subject,
    `<p style="margin-top:0;">Saludos <strong>${name}</strong>,</p>
    <p>Gracias por matricularte en el curso de navegación ofrecido por <strong>Boquerón Power Squadron</strong>. Nos alegra mucho contar con tu participación en esta experiencia educativa.</p>
    <p>Próximamente, el personal de Boquerón Power Squadron se estará comunicando contigo para ofrecerte más detalles sobre el itinerario del curso, las fechas, los requisitos y cualquier información adicional que necesites para prepararte adecuadamente.</p>
    <p>Te invitamos a participar activamente, hacer preguntas y aprovechar al máximo este curso. Nuestro objetivo es apoyarte para que desarrolles conocimientos importantes de seguridad, responsabilidad y buenas prácticas de navegación.</p>
    <p style="margin-bottom:0;">Cordialmente,<br /><strong>Boquerón Power Squadron</strong></p>`,
  );

  return { subject, html, text };
}

export function buildCertificateEmail(student: StudentEmailIdentity): {
  subject: string;
  html: string;
  text: string;
} {
  const name = studentDisplayName(student);
  const subject = 'Felicitaciones por aprobar el examen de navegación';
  const text = `Saludos ${name},

¡Felicitaciones! Nos alegra informarte que completaste exitosamente el examen de navegación.

Adjunto encontrarás el certificado oficial de aprobación del examen. Te recomendamos guardar una copia digital y, de ser posible, imprimir una copia para tus récords personales.

Como próximo paso, deberás utilizar este certificado para gestionar tu licencia en la oficina correspondiente del Departamento de Recursos Naturales y Ambientales (DRNA) de Puerto Rico.

En Boquerón Power Squadron celebramos tu logro y te deseamos mucho éxito en tus próximas experiencias de navegación.

Cordialmente,
Boquerón Power Squadron`;

  const html = baseHtml(
    subject,
    `<p style="margin-top:0;">Saludos <strong>${name}</strong>,</p>
    <p><strong>¡Felicitaciones!</strong> Nos alegra informarte que completaste exitosamente el examen de navegación.</p>
    <p>Adjunto encontrarás el certificado oficial de aprobación del examen. Te recomendamos guardar una copia digital y, de ser posible, imprimir una copia para tus récords personales.</p>
    <p>Como próximo paso, deberás utilizar este certificado para gestionar tu licencia en la oficina correspondiente del <strong>Departamento de Recursos Naturales y Ambientales (DRNA) de Puerto Rico</strong>.</p>
    <p>En Boquerón Power Squadron celebramos tu logro y te deseamos mucho éxito en tus próximas experiencias de navegación.</p>
    <p style="margin-bottom:0;">Cordialmente,<br /><strong>Boquerón Power Squadron</strong></p>`,
  );

  return { subject, html, text };
}
