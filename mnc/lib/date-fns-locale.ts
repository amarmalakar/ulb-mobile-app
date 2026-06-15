import type { Locale } from 'date-fns';
import { enGB } from 'date-fns/locale/en-GB';
import { hi } from 'date-fns/locale/hi';

import type { AppLocale } from '@/lib/i18n/locales';

export function getDateFnsLocale(language?: string | AppLocale): Locale {
  const base = (language ?? 'en').split('-')[0]?.toLowerCase();
  return base === 'hi' ? hi : enGB;
}
