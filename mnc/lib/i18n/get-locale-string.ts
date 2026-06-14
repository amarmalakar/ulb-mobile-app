import { getAppLocale } from '@/lib/i18n';
import type { AppLocale } from '@/lib/i18n/locales';

export type LocalizedStringRecord = Partial<Record<AppLocale, string | null | undefined>>;

/**
 * Picks the string for the active app locale from API `{ en, hi }` fields.
 * Falls back to English, then Hindi, then an empty string.
 */
export function getLocaleString(
  value: LocalizedStringRecord | null | undefined,
  locale: AppLocale = getAppLocale(),
): string {
  if (!value) {
    return '';
  }

  const localized = value[locale]?.trim();
  if (localized) {
    return localized;
  }

  const english = value.en?.trim();
  if (english) {
    return english;
  }

  const hindi = value.hi?.trim();
  if (hindi) {
    return hindi;
  }

  return '';
}
