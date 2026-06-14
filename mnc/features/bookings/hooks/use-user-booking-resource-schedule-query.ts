import { useQuery } from '@tanstack/react-query';

import { useNetworkContext } from '@/components/providers/network-provider';
import { useUserAuth } from '@/components/providers/user-auth-provider';
import { userBearerHeaders, throwUnlessOk } from '@/features/user-auth/utils/api-response';
import { API_PATHS } from '@/lib/api-paths';

import type { UserBookingResourceSchedule } from '../types';

export type UseUserBookingResourceScheduleQueryOptions = {
  resourceId: string | undefined;
  from: string | undefined;
  to: string | undefined;
  enabled?: boolean;
};

/** `GET /user/booking-resources/:resourceId/schedule?from=&to=` */
export function useUserBookingResourceScheduleQuery({
  resourceId,
  from,
  to,
  enabled = true,
}: UseUserBookingResourceScheduleQueryOptions) {
  const { client } = useNetworkContext();
  const { session, sessionHydrated, mpinUnlocked } = useUserAuth();
  const accessToken = session?.accessToken;
  const id = resourceId?.trim();

  return useQuery<UserBookingResourceSchedule, Error>({
    queryKey: ['user', 'booking-resources', id, 'schedule', from, to, accessToken],
    enabled:
      Boolean(accessToken) &&
      Boolean(id) &&
      Boolean(from) &&
      Boolean(to) &&
      sessionHydrated &&
      mpinUnlocked &&
      enabled,
    queryFn: async () => {
      const token = accessToken;
      if (!token || !id || !from || !to) {
        throw new Error('Missing schedule query parameters');
      }

      const response = (await client.get(API_PATHS.user.bookingResourceSchedule(id), {
        headers: userBearerHeaders(token),
        params: { from, to },
      })) as { ok?: boolean; data?: UserBookingResourceSchedule; message?: string };

      return throwUnlessOk<UserBookingResourceSchedule>(response, 'Failed to load schedule');
    },
  });
}
