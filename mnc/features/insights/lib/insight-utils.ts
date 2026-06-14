import type { InsightType, V2InsightItem } from '../types';

function normalizeLocale(locale: string | undefined): string {
  return (locale ?? 'en').split('-')[0]?.toLowerCase() || 'en';
}

export function getLocalizedInsightText(
  value: Record<string, string> | null | undefined,
  locale: string | undefined,
): string {
  if (!value) return '';
  const normalized = normalizeLocale(locale);
  return (
    value[normalized] ||
    value.en ||
    value.hi ||
    Object.values(value).find((entry) => entry?.trim().length > 0) ||
    ''
  );
}

export function getInsightTitle(item: V2InsightItem, locale: string | undefined): string {
  return getLocalizedInsightText(item.title, locale) || item.displayTitle?.trim() || item.id;
}

export function getInsightSubtitle(item: V2InsightItem, locale: string | undefined): string {
  return getLocalizedInsightText(item.subTitle, locale) || item.displaySubTitle?.trim() || '';
}

export function formatInsightDateRange(startDate: string | null, endDate: string | null): string | null {
  if (!startDate && !endDate) return null;

  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  const isValidStart = start ? !Number.isNaN(start.getTime()) : false;
  const isValidEnd = end ? !Number.isNaN(end.getTime()) : false;

  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  if (isValidStart && isValidEnd) return `${fmt(start!)} - ${fmt(end!)}`;
  if (isValidStart) return fmt(start!);
  if (isValidEnd) return fmt(end!);
  return null;
}

export function insightTypeTone(type: InsightType): string {
  switch (type) {
    case 'NEWS':
      return 'bg-blue-500/10 text-blue-600';
    case 'EVENT':
      return 'bg-emerald-500/10 text-emerald-600';
    case 'TENDERS':
      return 'bg-orange-500/10 text-orange-600';
    case 'JOBS':
      return 'bg-violet-500/10 text-violet-600';
    default:
      return 'bg-muted text-muted-foreground';
  }
}
