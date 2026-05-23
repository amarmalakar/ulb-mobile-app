import type { AxiosInstance } from 'axios';
import { useMutation } from '@tanstack/react-query';

import { useNetworkContext } from '@/components/provider/network-provider';
import { useUserAuth } from '@/components/provider/user-auth-provider';
import type { CreateUserBookingRequest, UserBookingDetail } from '@/features/bookings/types';
import { throwUnlessOk, userBearerHeaders } from '@/features/user-auth/utils/api-response';

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

/** `POST /user/booking-resources/:resourceId/bookings` */
export function useCreateUserBookingMutation(resourceId: string | undefined) {
  const { client, queryClient } = useNetworkContext();
  const { session } = useUserAuth();
  const accessToken = session?.accessToken;
  const id = resourceId?.trim();

  return useMutation<UserBookingDetail, Error, CreateUserBookingRequest>({
    mutationFn: async (body) => {
      const token = accessToken;
      if (!token || !id) {
        throw new Error('You must be signed in to book');
      }
      return postUserBooking(client, token, id, body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['user', 'booking-resources'] });
      void queryClient.invalidateQueries({ queryKey: ['user', 'bookings'] });
    },
  });
}
