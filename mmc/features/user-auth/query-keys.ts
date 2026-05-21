export const userQueryKeys = {
  all: ['user'] as const,
  mpinStatus: (accessToken: string | null | undefined) =>
    ['user', 'mpin', 'status', accessToken] as const,
  info: (accessToken: string | null | undefined) => ['user', 'info', accessToken] as const,
};
