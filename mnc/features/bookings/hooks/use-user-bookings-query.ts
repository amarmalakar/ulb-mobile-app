import type { AxiosInstance } from 'axios';
import { useInfiniteQuery } from '@tanstack/react-query';

import { useNetworkContext } from '@/components/providers/network-provider';
import { useUserAuth } from '@/components/providers/user-auth-provider';
import { userBearerHeaders, throwUnlessOk } from '@/features/user-auth/utils/api-response';
import { API_PATHS } from '@/lib/api-paths';

import type { UserBookingsPage } from '../types';

export const USER_BOOKINGS_DEFAULT_LIMIT = 10;
export const USER_BOOKINGS_MAX_LIMIT = 50;

type UserBookingsApiResponse = {
  ok?: boolean;
  data?: UserBookingsPage;
  message?: string;
};

export type UseUserBookingsInfiniteQueryOptions = {
  limit?: number;
  enabled?: boolean;
};

export async function fetchUserBookingsPage(
  client: AxiosInstance,
  accessToken: string,
  options: { limit: number; cursor?: string },
): Promise<UserBookingsPage> {
  const response = (await client.get(API_PATHS.user.bookings, {
    headers: userBearerHeaders(accessToken),
    params: {
      limit: options.limit,
      ...(options.cursor ? { cursor: options.cursor } : {}),
    },
  })) as UserBookingsApiResponse;

  return throwUnlessOk(response, 'Failed to load bookings');
}

/** Loads the signed-in user's bookings from `GET /user/bookings`. */
export function useUserBookingsInfiniteQuery(options?: UseUserBookingsInfiniteQueryOptions) {
  const { client } = useNetworkContext();
  const { session, sessionHydrated } = useUserAuth();
  const accessToken = session?.accessToken;
  const limit = Math.min(
    Math.max(1, options?.limit ?? USER_BOOKINGS_DEFAULT_LIMIT),
    USER_BOOKINGS_MAX_LIMIT,
  );

  return useInfiniteQuery<UserBookingsPage, Error>({
    queryKey: ['user', 'bookings', accessToken, limit],
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

      return fetchUserBookingsPage(client, token, { limit, cursor });
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.nextCursor ? lastPage.nextCursor : undefined,
  });
}
