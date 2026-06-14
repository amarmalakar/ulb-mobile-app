import type { AxiosInstance } from 'axios';
import { useQuery } from '@tanstack/react-query';

import { useNetworkContext } from '@/components/providers/network-provider';
import { useUserAuth } from '@/components/providers/user-auth-provider';
import { userBearerHeaders, throwUnlessOk } from '@/features/user-auth/utils/api-response';
import { API_PATHS } from '@/lib/api-paths';

import type { UserBookingByIdDetail } from '../types';

type UserBookingApiResponse = {
  ok?: boolean;
  data?: UserBookingByIdDetail;
  message?: string;
};

export type UseUserBookingQueryOptions = {
  bookingId: string | undefined;
  enabled?: boolean;
};

export async function fetchUserBooking(
  client: AxiosInstance,
  accessToken: string,
  bookingId: string,
): Promise<UserBookingByIdDetail> {
  const response = (await client.get(API_PATHS.user.bookingById(bookingId), {
    headers: userBearerHeaders(accessToken),
  })) as UserBookingApiResponse;

  return throwUnlessOk(response, 'Failed to load booking');
}

/** `GET /user/bookings/:bookingId` */
export function useUserBookingQuery({ bookingId, enabled = true }: UseUserBookingQueryOptions) {
  const { client } = useNetworkContext();
  const { session, sessionHydrated, mpinUnlocked } = useUserAuth();
  const accessToken = session?.accessToken;
  const id = bookingId?.trim();

  return useQuery<UserBookingByIdDetail, Error>({
    queryKey: ['user', 'bookings', 'detail', id, accessToken],
    enabled:
      Boolean(accessToken) &&
      Boolean(id) &&
      sessionHydrated &&
      mpinUnlocked &&
      enabled,
    queryFn: async () => {
      const token = accessToken;
      if (!token || !id) {
        throw new Error('Missing access token or booking id');
      }

      return fetchUserBooking(client, token, id);
    },
  });
}
