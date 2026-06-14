import { useQuery } from '@tanstack/react-query';

import { useNetworkContext } from '@/components/providers/network-provider';
import { useUserAuth } from '@/components/providers/user-auth-provider';
import { userBearerHeaders, throwUnlessOk } from '@/features/user-auth/utils/api-response';
import { API_PATHS } from '@/lib/api-paths';

import type { UserBookingResourceDetail } from '../types';

type UserBookingResourceDetailData = UserBookingResourceDetail & {
  schedule?: {
    bookings: Array<{
      id: string;
      startsAt: string;
      endsAt: string;
      status: string;
    }>;
    blocks: Array<{
      id: string;
      startsAt: string;
      endsAt: string;
      reason: string | null;
    }>;
  };
};

export type UseUserBookingResourceQueryOptions = {
  resourceId: string | undefined;
  enabled?: boolean;
};

/** `GET /user/booking-resources/:resourceId` */
export function useUserBookingResourceQuery({
  resourceId,
  enabled = true,
}: UseUserBookingResourceQueryOptions) {
  const { client } = useNetworkContext();
  const { session, sessionHydrated, mpinUnlocked } = useUserAuth();
  const accessToken = session?.accessToken;
  const id = resourceId?.trim();

  return useQuery<UserBookingResourceDetailData, Error>({
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

      const response = (await client.get(API_PATHS.user.bookingResourceById(id), {
        headers: userBearerHeaders(token),
      })) as { ok?: boolean; data?: UserBookingResourceDetailData; message?: string };

      return throwUnlessOk<UserBookingResourceDetailData>(
        response,
        'Failed to load booking resource',
      );
    },
  });
}
