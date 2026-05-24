import type { AxiosInstance } from 'axios';
import { useQuery } from '@tanstack/react-query';

import { useAuthContext } from '@/components/provider/auth-provider';
import { useNetworkContext } from '@/components/provider/network-provider';
import { useStaffAuth } from '@/components/provider/staff-auth-provider';
import { useUserAuth } from '@/components/provider/user-auth-provider';
import type { UserBookingResourceListItem } from '@/features/bookings/types';
import {
  staffBearerHeaders,
  throwUnlessOk,
} from '@/features/staff-auth/utils/api-response';
import { userBearerHeaders } from '@/features/user-auth/utils/api-response';

type BookingResourcesApiResponse = {
  ok: boolean;
  data?: UserBookingResourceListItem[];
  message?: string;
};

export type UseBookingResourcesQueryOptions = {
  enabled?: boolean;
};

async function fetchBookingResources(
  client: AxiosInstance,
  accessToken: string,
  path: string,
  headers: (token: string) => Record<string, string>,
): Promise<UserBookingResourceListItem[]> {
  const res = (await client.get(path, {
    headers: headers(accessToken),
  })) as BookingResourcesApiResponse;

  return throwUnlessOk(res, 'Failed to load booking resources');
}

/** `GET /user/booking-resources` */
export function useUserBookingResourcesQuery(options?: UseBookingResourcesQueryOptions) {
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
      return fetchBookingResources(
        client,
        token,
        '/user/booking-resources',
        userBearerHeaders,
      );
    },
  });
}

/** `GET /staff/booking-resources` */
export function useStaffBookingResourcesQuery(options?: UseBookingResourcesQueryOptions) {
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
      return fetchBookingResources(
        client,
        token,
        '/staff/booking-resources',
        staffBearerHeaders,
      );
    },
  });
}

/** Loads bookable resources for the active auth type. */
export function useBookingResourcesQuery(options?: UseBookingResourcesQueryOptions) {
  const { authType } = useAuthContext();
  const userQuery = useUserBookingResourcesQuery({
    ...options,
    enabled: (options?.enabled ?? true) && authType === 'User',
  });
  const staffQuery = useStaffBookingResourcesQuery({
    ...options,
    enabled: (options?.enabled ?? true) && authType === 'Staff',
  });

  return authType === 'Staff' ? staffQuery : userQuery;
}
