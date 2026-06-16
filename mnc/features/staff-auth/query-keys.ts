export const staffQueryKeys = {
  all: ['staff'] as const,
  info: (accessToken: string | null | undefined) => ['staff', 'info', accessToken] as const,
};
