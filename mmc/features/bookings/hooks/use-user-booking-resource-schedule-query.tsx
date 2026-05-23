import type { AxiosInstance } from 'axios';
import { useQuery } from '@tanstack/react-query';

import { useNetworkContext } from '@/components/provider/network-provider';
import { useUserAuth } from '@/components/provider/user-auth-provider';
import type { UserBookingResourceSchedule } from '@/features/bookings/types';
import { throwUnlessOk, userBearerHeaders } from '@/features/user-auth/utils/api-response';

type ScheduleApiResponse = {
  ok: boolean;
  data?: UserBookingResourceSchedule;
  message?: string;
};

export type UseUserBookingResourceScheduleQueryOptions = {
  resourceId: string | undefined;
  from: string | undefined;
  to: string | undefined;
  enabled?: boolean;
};

export async function fetchUserBookingResourceSchedule(
  client: AxiosInstance,
  accessToken: string,
  resourceId: string,
  from: string,
  to: string,
): Promise<UserBookingResourceSchedule> {
  const res = (await client.get(`/user/booking-resources/${resourceId}/schedule`, {
    headers: userBearerHeaders(accessToken),
    params: { from, to },
  })) as ScheduleApiResponse;

  return throwUnlessOk(res, 'Failed to load schedule');
}

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
      return fetchUserBookingResourceSchedule(client, token, id, from, to);
    },
  });
}
