import type { AxiosInstance } from 'axios';
import { useQuery } from '@tanstack/react-query';

import { useNetworkContext } from '@/components/provider/network-provider';
import { useStaffAuth } from '@/components/provider/staff-auth-provider';
import { staffBearerHeaders, throwUnlessOk } from '@/features/staff-auth/utils/api-response';
import type { StaffBookingDetail } from '@/features/staff-bookings/types';

type StaffBookingDetailApiResponse = {
  ok: boolean;
  data?: StaffBookingDetail;
  message?: string;
};

export async function fetchStaffBookingDetail(
  client: AxiosInstance,
  accessToken: string,
  bookingId: string,
): Promise<StaffBookingDetail> {
  const res = (await client.get(`/staff/bookings/${encodeURIComponent(bookingId)}`, {
    headers: staffBearerHeaders(accessToken),
  })) as StaffBookingDetailApiResponse;

  return throwUnlessOk(res, 'Failed to load booking');
}

export type UseStaffBookingQueryOptions = {
  bookingId: string | undefined;
  enabled?: boolean;
};

/** `GET /staff/bookings/:bookingId` */
export function useStaffBookingQuery(options: UseStaffBookingQueryOptions) {
  const { client } = useNetworkContext();
  const { session, sessionHydrated, mpinUnlocked } = useStaffAuth();
  const accessToken = session?.accessToken;
  const bookingId = options.bookingId;

  return useQuery<StaffBookingDetail, Error>({
    queryKey: ['staff', 'bookings', 'detail', accessToken, bookingId ?? ''],
    enabled:
      Boolean(accessToken && bookingId) &&
      sessionHydrated &&
      mpinUnlocked &&
      (options.enabled ?? true),
    queryFn: async () => {
      const token = accessToken;
      const id = bookingId;
      if (!token || !id) {
        throw new Error('Missing access token or booking id');
      }
      return fetchStaffBookingDetail(client, token, id);
    },
  });
}
