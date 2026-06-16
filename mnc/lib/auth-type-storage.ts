import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AuthType } from '@/types/auth';

export const AUTH_TYPE_STORAGE_KEY = 'auth-type';

let authTypeHeaderValue: AuthType = null;

export function setAuthTypeHeaderValue(value: AuthType) {
  authTypeHeaderValue = value && value.length > 0 ? value : null;
}

export function getAuthTypeHeaderValue() {
  return authTypeHeaderValue;
}

export function parseAuthType(stored: string | null): AuthType {
  if (stored === 'Staff' || stored === 'User') {
    return stored;
  }
  return null;
}

export async function loadAuthTypeFromStorage(): Promise<AuthType> {
  const stored = await AsyncStorage.getItem(AUTH_TYPE_STORAGE_KEY);
  return parseAuthType(stored);
}
