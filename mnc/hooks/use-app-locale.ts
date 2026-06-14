import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { changeAppLocale, getAppLocale } from '@/lib/i18n';
import type { AppLocale } from '@/lib/i18n/locales';

export function useAppLocale() {
  const { i18n, ready } = useTranslation();

  const locale = getAppLocale();

  const setLocale = useCallback(async (next: AppLocale) => {
    await changeAppLocale(next);
  }, []);

  return {
    locale,
    setLocale,
    localeHydrated: ready,
    i18n,
  };
}
