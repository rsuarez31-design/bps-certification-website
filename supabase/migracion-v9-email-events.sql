-- Migración v9: registro idempotente de emails transaccionales con Gmail API.
--
-- Objetivo:
-- - Evitar emails duplicados cuando el mismo evento llega por más de un flujo
--   (por ejemplo Stripe webhook + confirm-session).
-- - Dejar diagnóstico básico cuando un envío falla.
-- - Guardar en provider_message_id el id del mensaje devuelto por Gmail API.

create table if not exists public.email_events (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique,
  type text not null check (type in ('welcome', 'certificate')),
  recipient text not null,
  registration_id uuid null references public.registrations(id) on delete set null,
  attempt_id uuid null references public.exam_attempts(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'skipped')),
  provider_message_id text null, -- Gmail API message.id cuando el envío es exitoso.
  error_message text null,
  sent_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_email_events_type_created_at
  on public.email_events(type, created_at desc);

create index if not exists idx_email_events_registration_id
  on public.email_events(registration_id);

create index if not exists idx_email_events_attempt_id
  on public.email_events(attempt_id);

alter table public.email_events enable row level security;

-- No se crean políticas para anon/authenticated: esta tabla es operativa y debe
-- usarse desde el backend con SUPABASE_SERVICE_ROLE_KEY.
