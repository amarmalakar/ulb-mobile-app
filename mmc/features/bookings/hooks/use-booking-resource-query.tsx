import type { AxiosInstance } from 'axios';
import { useQuery } from '@tanstack/react-query';

import { useAuthContext } from '@/components/provider/auth-provider';
import { useNetworkContext } from '@/components/provider/network-provider';
import { useStaffAuth } from '@/components/provider/staff-auth-provider';
import { useUserAuth } from '@/components/provider/user-auth-provider';
import type { UserBookingResourceDetail } from '@/features/bookings/types';
import {
  staffBearerHeaders,
  throwUnlessOk,
} from '@/features/staff-auth/utils/api-response';
import { userBearerHeaders } from '@/features/user-auth/utils/api-response';

type BookingResourceApiResponse = {
  ok: boolean;
  data?: UserBookingResourceDetail;
  message?: string;
};

export type UseBookingResourceQueryOptions = {
  resourceId: string | undefined;
  enabled?: boolean;
};

async function fetchBookingResource(
  client: AxiosInstance,
  accessToken: string,
  path: string,
  headers: (token: string) => Record<string, string>,
): Promise<UserBookingResourceDetail> {
  const res = (await client.get(path, {
    headers: headers(accessToken),
  })) as BookingResourceApiResponse;

  return throwUnlessOk(res, 'Failed to load booking resource');
}

/** `GET /user/booking-resources/:resourceId` */
export function useUserBookingResourceQuery({
  resourceId,
  enabled = true,
}: UseBookingResourceQueryOptions) {
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
      return fetchBookingResource(
        client,
        token,
        `/user/booking-resources/${encodeURIComponent(id)}`,
        userBearerHeaders,
      );
    },
  });
}

/** `GET /staff/booking-resources/:resourceId` */
export function useStaffBookingResourceQuery({
  resourceId,
  enabled = true,
}: UseBookingResourceQueryOptions) {
  const { client } = useNetworkContext();
  const { session, sessionHydrated, mpinUnlocked } = useStaffAuth();
  const accessToken = session?.accessToken;
  const id = resourceId?.trim();

  return useQuery<UserBookingResourceDetail, Error>({
    queryKey: ['staff', 'booking-resources', id, accessToken],
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
      return fetchBookingResource(
        client,
        token,
        `/staff/booking-resources/${encodeURIComponent(id)}`,
        staffBearerHeaders,
      );
    },
  });
}

/** Loads one bookable resource for the active auth type. */
export function useBookingResourceQuery(options: UseBookingResourceQueryOptions) {
  const { authType } = useAuthContext();
  const userQuery = useUserBookingResourceQuery({
    ...options,
    enabled: (options.enabled ?? true) && authType === 'User',
  });
  const staffQuery = useStaffBookingResourceQuery({
    ...options,
    enabled: (options.enabled ?? true) && authType === 'Staff',
  });

  return authType === 'Staff' ? staffQuery : userQuery;
}
