export type FeaturedItemType = 'VIDEO' | 'IMAGE' | 'TEXT';

export type FeaturedLocaleJson = Record<string, string>;

export type FeaturedApiItem = {
  id: string;
  type: FeaturedItemType;
  order: number;
  title: FeaturedLocaleJson;
  subtitle: FeaturedLocaleJson | null;
  description: FeaturedLocaleJson | null;
  displayTitle: string;
  displaySubtitle: string | null;
  displayDescription: string | null;
  logo: string | null;
  image: string | null;
  video: string | null;
  link: string | null;
  linkText: string | null;
};

export type FeaturedListResponse = {
  ok: boolean;
  data?: FeaturedApiItem[];
  message?: string;
};

export type FeaturedDetailResponse = {
  ok: boolean;
  data?: FeaturedApiItem;
  message?: string;
};

export type FeaturedItem = {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  type: FeaturedItemType;
  logo?: string;
  image?: string;
  video?: string;
  link?: string;
  linkText?: string;
};