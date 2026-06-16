export const userQueryKeys = {
  all: ['user'] as const,
  info: (accessToken: string | null | undefined) => ['user', 'info', accessToken] as const,
};
