import { Platform } from 'react-native';

/**
 * Resolves bare R2 object keys to a public HTTPS URL.
 * Full `https://` URLs are returned as-is (with Android localhost fix when needed).
 */
export function resolveTicketImageUrl(
  urlOrKey: string,
  publicBaseUrl = process.env.EXPO_PUBLIC_R2_PUBLIC_BASE_URL?.trim() ?? '',
): string {
  const trimmed = urlOrKey.trim();
  if (!trimmed) {
    return trimmed;
  }

  let resolved = trimmed;
  if (!/^https?:\/\//i.test(trimmed)) {
    const base = publicBaseUrl.replace(/\/+$/, '');
    if (!base) {
      return trimmed;
    }
    resolved = `${base}/${trimmed.replace(/^\/+/, '')}`;
  }

  if (Platform.OS === 'android' && /localhost|127\.0\.0\.1/i.test(resolved)) {
    return resolved.replace(/localhost|127\.0\.0\.1/gi, '10.0.2.2');
  }

  return resolved;
}
