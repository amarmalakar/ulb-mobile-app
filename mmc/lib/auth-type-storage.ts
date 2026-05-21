import type { AuthType } from '@/types/auth';

export const AUTH_TYPE_STORAGE_KEY = 'auth-type';

let authTypeHeaderValue: AuthType = null;

export function setAuthTypeHeaderValue(value: AuthType) {
  authTypeHeaderValue = value && value.length > 0 ? value : null;
}

export function getAuthTypeHeaderValue() {
  return authTypeHeaderValue;
}
