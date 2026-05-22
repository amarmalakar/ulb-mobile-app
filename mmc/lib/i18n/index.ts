import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { loadStoredLocale, persistLocale } from '@/lib/locale-storage';
import { en } from '@/locales/en';
import { hi } from '@/locales/hi';
import { DEFAULT_LOCALE, type AppLocale, SUPPORTED_LOCALES } from '@/locales';

export const i18nResources = {
  en: { translation: en },
  hi: { translation: hi },
} as const;

function normalizeLocale(language: string | undefined): AppLocale {
  if (!language) return DEFAULT_LOCALE;
  const base = language.split('-')[0]?.toLowerCase();
  if (base === 'hi') return 'hi';
  return 'en';
}

let initPromise: Promise<typeof i18n> | null = null;

export function initI18n(): Promise<typeof i18n> {
  if (i18n.isInitialized) {
    return Promise.resolve(i18n);
  }

  if (!initPromise) {
    initPromise = (async () => {
      const stored = await loadStoredLocale();

      await i18n.use(initReactI18next).init({
        resources: i18nResources,
        lng: stored,
        fallbackLng: DEFAULT_LOCALE,
        supportedLngs: [...SUPPORTED_LOCALES],
        defaultNS: 'translation',
        ns: ['translation'],
        interpolation: {
          escapeValue: false,
        },
        react: {
          useSuspense: false,
        },
      });

      return i18n;
    })();
  }

  return initPromise;
}

export async function changeAppLocale(locale: AppLocale): Promise<void> {
  if (!SUPPORTED_LOCALES.includes(locale)) {
    throw new Error(`Unsupported locale: ${locale}`);
  }
  await initI18n();
  await i18n.changeLanguage(locale);
  await persistLocale(locale);
}

export function getAppLocale(): AppLocale {
  return normalizeLocale(i18n.language);
}

export { i18n };
