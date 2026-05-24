import type { AxiosInstance } from 'axios';
import { useQuery } from '@tanstack/react-query';

import { useNetworkContext } from '@/components/provider/network-provider';
import { useStaffAuth } from '@/components/provider/staff-auth-provider';
import type { UserBookingResourceSchedule } from '@/features/bookings/types';
import { staffBearerHeaders, throwUnlessOk } from '@/features/staff-auth/utils/api-response';

type ScheduleApiResponse = {
  ok: boolean;
  data?: UserBookingResourceSchedule;
  message?: string;
};

export type UseStaffBookingResourceScheduleQueryOptions = {
  resourceId: string | undefined;
  from: string | undefined;
  to: string | undefined;
  enabled?: boolean;
};

export async function fetchStaffBookingResourceSchedule(
  client: AxiosInstance,
  accessToken: string,
  resourceId: string,
  from: string,
  to: string,
): Promise<UserBookingResourceSchedule> {
  const res = (await client.get(
    `/staff/booking-resources/${encodeURIComponent(resourceId)}/schedule`,
    {
      headers: staffBearerHeaders(accessToken),
      params: { from, to },
    },
  )) as ScheduleApiResponse;

  return throwUnlessOk(res, 'Failed to load schedule');
}

/** `GET /staff/booking-resources/:resourceId/schedule?from=&to=` */
export function useStaffBookingResourceScheduleQuery({
  resourceId,
  from,
  to,
  enabled = true,
}: UseStaffBookingResourceScheduleQueryOptions) {
  const { client } = useNetworkContext();
  const { session, sessionHydrated, mpinUnlocked } = useStaffAuth();
  const accessToken = session?.accessToken;
  const id = resourceId?.trim();

  return useQuery<UserBookingResourceSchedule, Error>({
    queryKey: ['staff', 'booking-resources', id, 'schedule', from, to, accessToken],
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
      return fetchStaffBookingResourceSchedule(client, token, id, from, to);
    },
  });
}
