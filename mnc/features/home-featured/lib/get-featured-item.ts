import { HOME_FEATURED_ITEMS } from "../constants";
import { type FeaturedItem } from "../types";

export function getFeaturedItemById(
  featuredId: string | undefined,
): FeaturedItem | undefined {
  if (!featuredId) {
    return undefined;
  }

  return HOME_FEATURED_ITEMS.find((item) => item.id === featuredId);
}
