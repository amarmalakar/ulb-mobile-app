import AsyncStorage from '@react-native-async-storage/async-storage';

import { STAFF_SESSION_STORAGE_KEY } from '@/constants';
import type { StaffAuthSession } from '@/features/staff-auth/types';

let staffTokenHeaderValue: string | null = null;

export function setStaffTokenHeaderValue(token: string | null) {
  staffTokenHeaderValue = token && token.length > 0 ? token : null;
}

export function getStaffTokenHeaderValue() {
  return staffTokenHeaderValue;
}

export async function persistStaffSession(session: StaffAuthSession) {
  setStaffTokenHeaderValue(session.accessToken);
  await AsyncStorage.setItem(STAFF_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export async function loadStaffSession(): Promise<StaffAuthSession | null> {
  const raw = await AsyncStorage.getItem(STAFF_SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as StaffAuthSession;
    if (!session?.accessToken) return null;
    setStaffTokenHeaderValue(session.accessToken);
    return session;
  } catch {
    return null;
  }
}

export async function clearStaffSession() {
  setStaffTokenHeaderValue(null);
  await AsyncStorage.removeItem(STAFF_SESSION_STORAGE_KEY);
}
