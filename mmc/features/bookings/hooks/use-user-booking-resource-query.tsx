import type { AxiosInstance } from 'axios';
import { useQuery } from '@tanstack/react-query';

import { useNetworkContext } from '@/components/provider/network-provider';
import { useUserAuth } from '@/components/provider/user-auth-provider';
import type { UserBookingResourceDetail } from '@/features/bookings/types';
import { throwUnlessOk, userBearerHeaders } from '@/features/user-auth/utils/api-response';

type UserBookingResourceApiResponse = {
  ok: boolean;
  data?: UserBookingResourceDetail;
  message?: string;
};

export type UseUserBookingResourceQueryOptions = {
  resourceId: string | undefined;
  enabled?: boolean;
};

export async function fetchUserBookingResource(
  client: AxiosInstance,
  accessToken: string,
  resourceId: string,
): Promise<UserBookingResourceDetail> {
  const res = (await client.get(`/user/booking-resources/${resourceId}`, {
    headers: userBearerHeaders(accessToken),
  })) as UserBookingResourceApiResponse;

  return throwUnlessOk(res, 'Failed to load booking resource');
}

/** Loads one resource from `GET /user/booking-resources/:resourceId`. */
export function useUserBookingResourceQuery({
  resourceId,
  enabled = true,
}: UseUserBookingResourceQueryOptions) {
  const { client } = useNetworkContext();
  const { session, sessionHydrated, mpinUnlocked } = useUserAuth();
  const accessToken = session?.accessToken;
  const id = resourceId?.trim();

  return useQuery<UserBookingResourceDetail, Error>({
    queryKey: ['user', 'booking-resources', id, accessToken],
    enabled:
      Boolean(accessToken) &&
      Boolean(id) &&
      sessionHydrated &&
      mpinUnlocked &&
      enabled,
    queryFn: async () => {
      const token = accessToken;
      if (!token || !id) {
        throw new Error('Missing access token or resource id');
      }
      return fetchUserBookingResource(client, token, id);
    },
  });
}
