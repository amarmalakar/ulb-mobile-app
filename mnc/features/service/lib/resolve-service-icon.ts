import { CircleHelp, type LucideIcon } from 'lucide-react-native';
import * as LucideIcons from 'lucide-react-native';

// @ts-ignore
const lucideIconMap = LucideIcons as Record<string, LucideIcon | undefined>;

const DEFAULT_SERVICE_ICON = CircleHelp;

/**
 * Resolves a Lucide icon component from the API `icon` string.
 * Admin stores PascalCase names without the `Icon` suffix (e.g. `Droplet`).
 */
export function resolveServiceIcon(iconName?: string | null): LucideIcon {
  const trimmed = iconName?.trim();
  if (!trimmed) {
    return DEFAULT_SERVICE_ICON;
  }

  const direct = lucideIconMap[trimmed];
  if (direct) {
    return direct;
  }

  const withIconSuffix = lucideIconMap[`${trimmed}Icon`];
  if (withIconSuffix) {
    return withIconSuffix;
  }

  return DEFAULT_SERVICE_ICON;
}
