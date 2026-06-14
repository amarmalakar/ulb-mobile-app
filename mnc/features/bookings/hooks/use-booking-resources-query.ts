import { useQuery } from '@tanstack/react-query';

import { useNetworkContext } from '@/components/providers/network-provider';
import { useUserAuth } from '@/components/providers/user-auth-provider';
import { userBearerHeaders, throwUnlessOk } from '@/features/user-auth/utils/api-response';
import { API_PATHS } from '@/lib/api-paths';

import type { UserBookingResourceListItem } from '../types';

type UseUserBookingResourcesQueryOptions = {
  enabled?: boolean;
};

/** `GET /user/booking-resources` */
export function useUserBookingResourcesQuery(options?: UseUserBookingResourcesQueryOptions) {
  const { client } = useNetworkContext();
  const { session, sessionHydrated, mpinUnlocked } = useUserAuth();
  const accessToken = session?.accessToken;

  return useQuery<UserBookingResourceListItem[], Error>({
    queryKey: ['user', 'booking-resources', accessToken],
    enabled:
      Boolean(accessToken) &&
      sessionHydrated &&
      mpinUnlocked &&
      (options?.enabled ?? true),
    queryFn: async () => {
      const token = accessToken;
      if (!token) {
        throw new Error('Missing access token');
      }

      const response = (await client.get(API_PATHS.user.bookingResources, {
        headers: userBearerHeaders(token),
      })) as { ok?: boolean; data?: UserBookingResourceListItem[]; message?: string };

      return throwUnlessOk<UserBookingResourceListItem[]>(
        response,
        'Failed to load booking resources',
      );
    },
  });
}
