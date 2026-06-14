export const staffQueryKeys = {
  all: ['staff'] as const,
  mpinStatus: (accessToken: string | null | undefined) =>
    ['staff', 'mpin', 'status', accessToken] as const,
  info: (accessToken: string | null | undefined) => ['staff', 'info', accessToken] as const,
};
