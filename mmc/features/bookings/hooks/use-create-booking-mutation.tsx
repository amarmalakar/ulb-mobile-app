import type { AxiosInstance } from 'axios';
import { useMutation } from '@tanstack/react-query';

import { useAuthContext } from '@/components/provider/auth-provider';
import { useNetworkContext } from '@/components/provider/network-provider';
import { useStaffAuth } from '@/components/provider/staff-auth-provider';
import { useUserAuth } from '@/components/provider/user-auth-provider';
import type { CreateUserBookingRequest, UserBookingDetail } from '@/features/bookings/types';
import { staffBearerHeaders, throwUnlessOk } from '@/features/staff-auth/utils/api-response';
import { userBearerHeaders } from '@/features/user-auth/utils/api-response';

type CreateBookingApiResponse = {
  ok: boolean;
  data?: UserBookingDetail;
  message?: string;
};

export async function postUserBooking(
  client: AxiosInstance,
  accessToken: string,
  resourceId: string,
  body: CreateUserBookingRequest,
): Promise<UserBookingDetail> {
  const res = (await client.post(`/user/booking-resources/${resourceId}/bookings`, body, {
    headers: userBearerHeaders(accessToken),
  })) as CreateBookingApiResponse;

  return throwUnlessOk(res, 'Failed to create booking');
}

export async function postStaffBooking(
  client: AxiosInstance,
  accessToken: string,
  resourceId: string,
  body: CreateUserBookingRequest,
): Promise<UserBookingDetail> {
  const res = (await client.post(
    `/staff/booking-resources/${encodeURIComponent(resourceId)}/bookings`,
    body,
    { headers: staffBearerHeaders(accessToken) },
  )) as CreateBookingApiResponse;

  return throwUnlessOk(res, 'Failed to create booking');
}

/** `POST …/booking-resources/:resourceId/bookings` — user or staff route from `authType`. */
export function useCreateBookingMutation(resourceId: string | undefined) {
  const { authType } = useAuthContext();
  const { client, queryClient } = useNetworkContext();
  const { session: userSession } = useUserAuth();
  const { session: staffSession } = useStaffAuth();
  const id = resourceId?.trim();
  const isStaff = authType === 'Staff';

  return useMutation<UserBookingDetail, Error, CreateUserBookingRequest>({
    mutationFn: async (body) => {
      if (!id) {
        throw new Error('Missing resource id');
      }
      if (isStaff) {
        const token = staffSession?.accessToken;
        if (!token) {
          throw new Error('You must be signed in');
        }
        return postStaffBooking(client, token, id, body);
      }
      const token = userSession?.accessToken;
      if (!token) {
        throw new Error('You must be signed in to book');
      }
      return postUserBooking(client, token, id, body);
    },
    onSuccess: () => {
      if (isStaff) {
        void queryClient.invalidateQueries({ queryKey: ['staff', 'booking-resources'] });
        void queryClient.invalidateQueries({ queryKey: ['staff', 'bookings'] });
        return;
      }
      void queryClient.invalidateQueries({ queryKey: ['user', 'booking-resources'] });
      void queryClient.invalidateQueries({ queryKey: ['user', 'bookings'] });
    },
  });
}
