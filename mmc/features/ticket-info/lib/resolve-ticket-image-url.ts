/**
 * Ticket APIs should return HTTPS `imageUrl`. This resolves bare R2 keys when needed.
 */
export function resolveTicketImageUrl(
	urlOrKey: string,
	publicBaseUrl = process.env.EXPO_PUBLIC_R2_PUBLIC_BASE_URL?.trim() ?? "",
): string {
	const trimmed = urlOrKey.trim();
	if (!trimmed) {
		return trimmed;
	}
	if (/^https?:\/\//i.test(trimmed)) {
		return trimmed;
	}
	const base = publicBaseUrl.replace(/\/+$/, "");
	if (!base) {
		return trimmed;
	}
	return `${base}/${trimmed.replace(/^\/+/, "")}`;
}
