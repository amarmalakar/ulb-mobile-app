import { en, type TranslationSchema } from './en';
import { hi } from './hi';

export type AppLocale = 'en' | 'hi';

export const DEFAULT_LOCALE: AppLocale = 'en';

export const SUPPORTED_LOCALES: readonly AppLocale[] = ['en', 'hi'] as const;

export { en, hi };
export type { TranslationSchema };
export type { TranslationKey } from './keys';
