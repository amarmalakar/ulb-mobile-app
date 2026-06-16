import type { AxiosInstance } from 'axios';
import { useQuery } from '@tanstack/react-query';

import { useNetworkContext } from '@/components/providers/network-provider';
import { useStaffAuth } from '@/components/providers/staff-auth-provider';
import { staffBearerHeaders, throwUnlessOk } from '@/features/staff-auth/utils/api-response';
import { API_PATHS } from '@/lib/api-paths';

import type { StaffBookingDetail } from '../types';

type StaffBookingDetailApiResponse = {
  ok?: boolean;
  data?: StaffBookingDetail;
  message?: string;
};

export async function fetchStaffBookingDetail(
  client: AxiosInstance,
  accessToken: string,
  bookingId: string,
): Promise<StaffBookingDetail> {
  const response = (await client.get(API_PATHS.staff.bookingById(bookingId), {
    headers: staffBearerHeaders(accessToken),
  })) as StaffBookingDetailApiResponse;

  return throwUnlessOk(response, 'Failed to load booking');
}

export type UseStaffBookingQueryOptions = {
  bookingId: string | undefined;
  enabled?: boolean;
};

/** `GET /staff/bookings/:bookingId` */
export function useStaffBookingQuery({ bookingId, enabled = true }: UseStaffBookingQueryOptions) {
  const { client } = useNetworkContext();
  const { session, sessionHydrated } = useStaffAuth();
  const accessToken = session?.accessToken;
  const id = bookingId?.trim();

  return useQuery<StaffBookingDetail, Error>({
    queryKey: ['staff', 'bookings', 'detail', id, accessToken],
    enabled:
      Boolean(accessToken) &&
      Boolean(id) &&
      sessionHydrated &&
      enabled,
    queryFn: async () => {
      const token = accessToken;
      if (!token || !id) {
        throw new Error('Missing access token or booking id');
      }
      return fetchStaffBookingDetail(client, token, id);
    },
  });
}
