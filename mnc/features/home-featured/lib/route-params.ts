export function featuredIdFromParams(params: {
  featuredId?: string | string[];
}): string | undefined {
  const value = params.featuredId;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}
