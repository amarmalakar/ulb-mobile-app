export function firstParam(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

/** Supports `resourceId` and legacy `bookingId` (was used for resource id on info/create routes). */
export function resourceIdFromParams(params: {
  resourceId?: string | string[];
  bookingId?: string | string[];
}): string | undefined {
  return firstParam(params.resourceId) ?? firstParam(params.bookingId);
}
