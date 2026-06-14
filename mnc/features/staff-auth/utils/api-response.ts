export function throwUnlessOk<T>(
  res: { ok?: boolean; data?: T; message?: string },
  fallbackMessage: string,
): T {
  if (!res.ok || res.data === undefined) {
    throw new Error(res.message ?? fallbackMessage);
  }
  return res.data;
}

export function staffBearerHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` } as const;
}
