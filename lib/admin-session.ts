import { NextRequest } from 'next/server';

const ADMIN_SESSION_COOKIE = 'bps_admin_session';
const SESSION_TTL_SECONDS = 12 * 60 * 60;

function buildSessionToken(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || 'bps-admin-session';
}

export function getAdminSessionCookieName(): string {
  return ADMIN_SESSION_COOKIE;
}

export function getAdminSessionToken(): string {
  return buildSessionToken();
}

export function getAdminSessionTtlSeconds(): number {
  return SESSION_TTL_SECONDS;
}

export function hasValidAdminSession(request: NextRequest): boolean {
  const cookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value || '';
  return cookie !== '' && cookie === buildSessionToken();
}
