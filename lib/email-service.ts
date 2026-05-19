import { randomUUID } from 'crypto';
import { google } from 'googleapis';
import { supabaseAdmin } from '@/lib/supabase-server';

type EmailEventType = 'welcome' | 'certificate';
type EmailEventStatus = 'sent' | 'failed' | 'skipped';

export type EmailAttachment = {
  filename: string;
  content: string;
  contentType?: string;
};

export type SendEmailWithEventInput = {
  eventKey: string;
  type: EmailEventType;
  recipient: string;
  registrationId?: string | null;
  attemptId?: string | null;
  subject: string;
  html: string;
  text: string;
  attachments?: EmailAttachment[];
};

type EmailEventResult = {
  ok: boolean;
  status: EmailEventStatus;
  skippedReason?: string;
  error?: string;
};

function isDuplicateEventError(error: unknown): boolean {
  const err = error as { code?: string; message?: string } | null;
  const message = String(err?.message || '').toLowerCase();
  return err?.code === '23505' || message.includes('duplicate key') || message.includes('already exists');
}

async function updateEmailEvent(
  id: string,
  status: EmailEventStatus,
  data: { providerMessageId?: string | null; errorMessage?: string | null } = {},
) {
  const { error } = await supabaseAdmin
    .from('email_events')
    .update({
      status,
      provider_message_id: data.providerMessageId ?? null,
      error_message: data.errorMessage ?? null,
      sent_at: status === 'sent' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('email_events: no se pudo actualizar el evento', error);
  }
}

async function reserveEmailEvent(input: SendEmailWithEventInput): Promise<{ id: string } | { skipped: true; reason: string }> {
  const { data, error } = await supabaseAdmin
    .from('email_events')
    .insert({
      event_key: input.eventKey,
      type: input.type,
      recipient: input.recipient,
      registration_id: input.registrationId || null,
      attempt_id: input.attemptId || null,
      status: 'pending',
    })
    .select('id')
    .single();

  if (error) {
    if (isDuplicateEventError(error)) {
      return { skipped: true, reason: 'duplicate' };
    }
    console.error('email_events: no se pudo reservar el evento', error);
    return { skipped: true, reason: 'email_events_unavailable' };
  }

  return { id: data.id as string };
}

function getEmailConfig():
  | {
      clientId: string;
      clientSecret: string;
      refreshToken: string;
      sender: string;
      replyTo?: string;
    }
  | { error: string } {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN || '';
  const sender = process.env.GMAIL_SENDER || '';
  const replyTo = process.env.EMAIL_REPLY_TO || undefined;

  if (!clientId || !clientSecret || !refreshToken || !sender) {
    return {
      error:
        'GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN y GMAIL_SENDER son requeridos para enviar emails con Gmail API.',
    };
  }

  return { clientId, clientSecret, refreshToken, sender, replyTo };
}

function encodeHeader(value: string): string {
  return `=?UTF-8?B?${Buffer.from(value, 'utf8').toString('base64')}?=`;
}

function encodeBase64(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64');
}

function toBase64Url(value: string): string {
  return Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function buildMimeMessage(input: SendEmailWithEventInput & { recipient: string; sender: string; replyTo?: string }): string {
  const mixedBoundary = `bps_mixed_${randomUUID()}`;
  const alternativeBoundary = `bps_alt_${randomUUID()}`;
  const headers = [
    `From: ${input.sender}`,
    `To: ${input.recipient}`,
    input.replyTo ? `Reply-To: ${input.replyTo}` : null,
    `Subject: ${encodeHeader(input.subject)}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${mixedBoundary}"`,
  ].filter((header): header is string => typeof header === 'string');

  const parts: string[] = [
    ...headers,
    '',
    `--${mixedBoundary}`,
    `Content-Type: multipart/alternative; boundary="${alternativeBoundary}"`,
    '',
    `--${alternativeBoundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    encodeBase64(input.text),
    '',
    `--${alternativeBoundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    encodeBase64(input.html),
    '',
    `--${alternativeBoundary}--`,
  ];

  for (const attachment of input.attachments || []) {
    parts.push(
      '',
      `--${mixedBoundary}`,
      `Content-Type: ${attachment.contentType || 'application/octet-stream'}; name="${attachment.filename}"`,
      'Content-Transfer-Encoding: base64',
      `Content-Disposition: attachment; filename="${attachment.filename}"`,
      '',
      attachment.content,
    );
  }

  parts.push('', `--${mixedBoundary}--`, '');

  return parts.join('\r\n');
}

export async function sendEmailWithEvent(input: SendEmailWithEventInput): Promise<EmailEventResult> {
  const recipient = input.recipient.trim().toLowerCase();
  if (!recipient) {
    return { ok: false, status: 'skipped', skippedReason: 'recipient_empty' };
  }

  const reserved = await reserveEmailEvent({ ...input, recipient });
  if ('skipped' in reserved) {
    return { ok: reserved.reason === 'duplicate', status: 'skipped', skippedReason: reserved.reason };
  }

  const config = getEmailConfig();
  if ('error' in config) {
    await updateEmailEvent(reserved.id, 'skipped', { errorMessage: config.error });
    console.warn(`Email omitido (${input.eventKey}): ${config.error}`);
    return { ok: false, status: 'skipped', skippedReason: 'email_not_configured', error: config.error };
  }

  try {
    const auth = new google.auth.OAuth2(config.clientId, config.clientSecret);
    auth.setCredentials({ refresh_token: config.refreshToken });

    const gmail = google.gmail({ version: 'v1', auth });
    const raw = toBase64Url(
      buildMimeMessage({
        ...input,
        recipient,
        sender: config.sender,
        replyTo: config.replyTo,
      }),
    );

    const { data } = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw },
    });

    if (!data.id) {
      const message = 'Gmail API no devolvió id del mensaje.';
      await updateEmailEvent(reserved.id, 'failed', { errorMessage: message });
      console.error(`Email falló (${input.eventKey}): ${message}`);
      return { ok: false, status: 'failed', error: message };
    }

    await updateEmailEvent(reserved.id, 'sent', { providerMessageId: data.id });
    return { ok: true, status: 'sent' };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    await updateEmailEvent(reserved.id, 'failed', { errorMessage: message });
    console.error(`Email falló (${input.eventKey}):`, e);
    return { ok: false, status: 'failed', error: message };
  }
}
