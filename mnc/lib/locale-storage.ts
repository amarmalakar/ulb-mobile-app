import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';

import { LOCALE_STORAGE_KEY } from '@/constants';
import { DEFAULT_LOCALE, type AppLocale, SUPPORTED_LOCALES } from '@/lib/i18n/locales';

function isAppLocale(value: string | null | undefined): value is AppLocale {
  return value === 'en' || value === 'hi';
}

function deviceLocale(): AppLocale {
  const code = getLocales()[0]?.languageCode?.toLowerCase();
  return code === 'hi' ? 'hi' : DEFAULT_LOCALE;
}

export async function loadStoredLocale(): Promise<AppLocale> {
  const raw = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
  if (isAppLocale(raw)) return raw;
  return deviceLocale();
}

export async function persistLocale(locale: AppLocale): Promise<void> {
  if (!SUPPORTED_LOCALES.includes(locale)) {
    throw new Error(`Unsupported locale: ${locale}`);
  }
  await AsyncStorage.setItem(LOCALE_STORAGE_KEY, locale);
}
