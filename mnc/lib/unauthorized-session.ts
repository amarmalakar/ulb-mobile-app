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
  '/signin/otp',
] as const;

function isExcludedAuthRoute(url: string): boolean {
  return AUTH_ROUTES_WITHOUT_SESSION_LOGOUT.some((segment) => url.includes(segment));
}

/** True when the API message indicates the stored session was revoked server-side. */
export function isUnauthorizedSessionMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes('session revoked') || lower.includes('revoked or expired');
}

/** True when the authenticated account no longer exists on the server. */
export function isAccountNotFoundMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes('staff not found') || lower.includes('user not found');
}

/** True when the server rejected the bearer access token (not wrong OTP/credentials). */
export function isUnauthorizedSessionError(error: ApiError): boolean {
  return error.status === 401 && isUnauthorizedSessionMessage(error.message);
}

/** True when the stored session should be cleared and the user sent to Get Started. */
export function isInvalidAuthSessionError(error: ApiError): boolean {
  if (isAccountNotFoundMessage(error.message)) {
    return true;
  }

  return isUnauthorizedSessionError(error);
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

  if (!isInvalidAuthSessionError(error)) {
    return;
  }

  handling = true;
  try {
    await handler();
  } finally {
    handling = false;
  }
}
