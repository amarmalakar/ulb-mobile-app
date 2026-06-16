import type { AxiosInstance } from 'axios';
import { useInfiniteQuery } from '@tanstack/react-query';

import { useNetworkContext } from '@/components/providers/network-provider';
import { useUserAuth } from '@/components/providers/user-auth-provider';
import { userBearerHeaders, throwUnlessOk } from '@/features/user-auth/utils/api-response';
import { API_PATHS } from '@/lib/api-paths';

import type { UserTicketsPage } from '../types';

export const USER_TICKETS_DEFAULT_LIMIT = 10;
export const USER_TICKETS_MAX_LIMIT = 50;

type UserTicketsApiResponse = {
  ok?: boolean;
  data?: UserTicketsPage;
  message?: string;
};

export type UseUserTicketsInfiniteQueryOptions = {
  limit?: number;
  enabled?: boolean;
};

export async function fetchUserTicketsPage(
  client: AxiosInstance,
  accessToken: string,
  options: { limit: number; cursor?: string },
): Promise<UserTicketsPage> {
  const response = (await client.get(API_PATHS.user.tickets, {
    headers: userBearerHeaders(accessToken),
    params: {
      limit: options.limit,
      ...(options.cursor ? { cursor: options.cursor } : {}),
    },
  })) as UserTicketsApiResponse;

  return throwUnlessOk(response, 'Failed to load tickets');
}

/** Loads the signed-in citizen's tickets from `GET /user/tickets`. */
export function useUserTicketsInfiniteQuery(options?: UseUserTicketsInfiniteQueryOptions) {
  const { client } = useNetworkContext();
  const { session, sessionHydrated } = useUserAuth();
  const accessToken = session?.accessToken;
  const limit = Math.min(
    Math.max(1, options?.limit ?? USER_TICKETS_DEFAULT_LIMIT),
    USER_TICKETS_MAX_LIMIT,
  );

  return useInfiniteQuery<UserTicketsPage, Error>({
    queryKey: ['user', 'tickets', accessToken, limit],
    enabled:
      Boolean(accessToken) &&
      sessionHydrated &&
      (options?.enabled ?? true),
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const token = accessToken;
      if (!token) {
        throw new Error('Missing access token');
      }

      const cursor =
        typeof pageParam === 'string' && pageParam.length > 0 ? pageParam : undefined;

      return fetchUserTicketsPage(client, token, { limit, cursor });
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.nextCursor ? lastPage.nextCursor : undefined,
  });
}
