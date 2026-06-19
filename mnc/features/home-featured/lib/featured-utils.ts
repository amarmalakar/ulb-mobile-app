import type { FeaturedApiItem, FeaturedItem } from '../types';

function normalizeLocale(locale: string | undefined): string {
  return (locale ?? 'en').split('-')[0]?.toLowerCase() || 'en';
}

export function getLocalizedFeaturedText(
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

export function mapUserFeaturedToItem(
  item: FeaturedApiItem,
  locale: string | undefined,
): FeaturedItem {
  return {
    id: item.id,
    type: item.type,
    title: getLocalizedFeaturedText(item.title, locale) || item.displayTitle,
    subtitle:
      getLocalizedFeaturedText(item.subtitle, locale) ||
      item.displaySubtitle?.trim() ||
      undefined,
    description:
      getLocalizedFeaturedText(item.description, locale) ||
      item.displayDescription?.trim() ||
      '',
    logo: item.logo ?? undefined,
    image: item.image ?? undefined,
    video: item.video ?? undefined,
    link: item.link ?? undefined,
    linkText: item.linkText ?? undefined,
  };
}

export function mapUserFeaturedList(
  items: FeaturedApiItem[],
  locale: string | undefined,
): FeaturedItem[] {
  return items.map((item) => mapUserFeaturedToItem(item, locale));
}
