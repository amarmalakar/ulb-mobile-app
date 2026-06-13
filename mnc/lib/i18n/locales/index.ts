import { en, type TranslationSchema } from '@/lib/i18n/locales/en';
import { hi } from '@/lib/i18n/locales/hi';

export type AppLocale = 'en' | 'hi';

export const DEFAULT_LOCALE: AppLocale = 'en';

export const SUPPORTED_LOCALES: readonly AppLocale[] = ['en', 'hi'] as const;

export { en, hi };
export type { TranslationSchema };
export type { TranslationKey } from '@/lib/i18n/locales/keys';
