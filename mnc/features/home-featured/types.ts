export type FeaturedItemType = 'VIDEO' | 'IMAGE' | 'TEXT';

export type FeaturedItem = {
  id: string;
  title: string;
  description: string;
  type: FeaturedItemType;
  logo?: string;
  image: string;
  link?: string;
  linkText?: string;
};