import type { AxiosInstance } from 'axios';
import { useQuery } from '@tanstack/react-query';

import { useNetworkContext } from '@/components/provider/network-provider';
import { useUserAuth } from '@/components/provider/user-auth-provider';
import type { UserBookingResourceListItem } from '@/features/bookings/types';
import { throwUnlessOk, userBearerHeaders } from '@/features/user-auth/utils/api-response';
import { useStaffAuth } from '@/components/provider/staff-auth-provider';

type UserBookingResourcesApiResponse = {
  ok: boolean;
  data?: UserBookingResourceListItem[];
  message?: string;
};

export type UseUserBookingResourcesQueryOptions = {
  enabled?: boolean;
};

export async function fetchUserBookingResources(
  client: AxiosInstance,
  accessToken: string,
  path: string,
): Promise<UserBookingResourceListItem[]> {
  const res = (await client.get(path, {
    headers: userBearerHeaders(accessToken),
  })) as UserBookingResourcesApiResponse;

  return throwUnlessOk(res, 'Failed to load booking resources');
}

/** Loads bookable resources from `GET /user/booking-resources`. */
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
      return fetchUserBookingResources(client, token, '/user/booking-resources');
    },
  });
}

/** Loads bookable resources from `GET /staff/booking-resources`. */
export function useStaffBookingResourcesQuery(options?: UseUserBookingResourcesQueryOptions) {
  const { client } = useNetworkContext();
  const { session, sessionHydrated, mpinUnlocked } = useStaffAuth();
  const accessToken = session?.accessToken;

  return useQuery<UserBookingResourceListItem[], Error>({
    queryKey: ['staff', 'booking-resources', accessToken],
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
      return fetchUserBookingResources(client, token, '/staff/booking-resources');
    },
  });
}