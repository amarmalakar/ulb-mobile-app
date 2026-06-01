import type { ApiError } from '@/lib/api-client';
import { getAuthTypeHeaderValue } from '@/lib/auth-type-storage';
import { getStaffTokenHeaderValue } from '@/lib/staff-auth-storage';
import { getUserTokenHeaderValue } from '@/lib/user-auth-storage';

export type UnauthorizedSessionHandler = () => void | Promise<void>;

let handler: UnauthorizedSessionHandler | null = null;
let handling = false;

/** Register from AuthProvider — clears session and routes to login. */
export function setUnauthorizedSessionHandler(next: UnauthorizedSessionHandler | null) {
  handler = next;
}

const AUTH_ROUTES_WITHOUT_SESSION_LOGOUT = [
  '/login',
  '/signup',
  '/verify',
  '/mpin/verify',
] as const;

function isExcludedAuthRoute(url: string): boolean {
  return AUTH_ROUTES_WITHOUT_SESSION_LOGOUT.some((segment) => url.includes(segment));
}

/** True when the server rejected the bearer access token (not wrong MPIN/credentials). */
export function isUnauthorizedSessionError(error: ApiError): boolean {
  if (error.status !== 401) {
    return false;
  }

  const message = error.message.toLowerCase();
  return message.includes('access token') || (message.includes('expired') && message.includes('token'));
}

function hasActiveSessionToken(): boolean {
  const authType = getAuthTypeHeaderValue();
  if (authType === 'Staff') {
    return Boolean(getStaffTokenHeaderValue());
  }
  if (authType === 'User') {
    return Boolean(getUserTokenHeaderValue());
  }
  return false;
}

export async function notifyUnauthorizedSession(
  error: ApiError,
  requestUrl?: string,
): Promise<void> {
  if (!handler || handling || !hasActiveSessionToken()) {
    return;
  }

  if (requestUrl && isExcludedAuthRoute(requestUrl)) {
    return;
  }

  if (!isUnauthorizedSessionError(error)) {
    return;
  }

  handling = true;
  try {
    await handler();
  } finally {
    handling = false;
  }
}
