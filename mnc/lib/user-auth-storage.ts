import AsyncStorage from '@react-native-async-storage/async-storage';

import { USER_SESSION_STORAGE_KEY } from '@/constants';
import type { UserAuthSession } from '@/features/user-auth/types/index';

let userTokenHeaderValue: string | null = null;

export function setUserTokenHeaderValue(token: string | null) {
  userTokenHeaderValue = token && token.length > 0 ? token : null;
}

export function getUserTokenHeaderValue() {
  return userTokenHeaderValue;
}

export async function persistUserSession(session: UserAuthSession) {
  setUserTokenHeaderValue(session.accessToken);
  await AsyncStorage.setItem(USER_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export async function loadUserSession(): Promise<UserAuthSession | null> {
  const raw = await AsyncStorage.getItem(USER_SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as UserAuthSession;
    if (!session?.accessToken || !session?.refreshToken) return null;
    setUserTokenHeaderValue(session.accessToken);
    return session;
  } catch {
    return null;
  }
}

export async function updateUserSessionTokens(tokens: {
  accessToken: string;
  refreshToken?: string;
}) {
  const session = await loadUserSession();
  if (!session) return null;
  const next: UserAuthSession = {
    ...session,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken ?? session.refreshToken,
  };
  setUserTokenHeaderValue(next.accessToken);
  await persistUserSession(next);
  return next;
}

export async function clearUserSession() {
  setUserTokenHeaderValue(null);
  await AsyncStorage.removeItem(USER_SESSION_STORAGE_KEY);
}
