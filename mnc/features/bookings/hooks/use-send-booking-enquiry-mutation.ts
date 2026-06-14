import { useMutation } from '@tanstack/react-query';

import { useNetworkContext } from '@/components/providers/network-provider';
import { useUserAuth } from '@/components/providers/user-auth-provider';
import { userBearerHeaders, throwUnlessOk } from '@/features/user-auth/utils/api-response';
import { API_PATHS } from '@/lib/api-paths';

import type { SendBookingEnquiryRequest, UserBookingDetail } from '../types';

/** `POST /user/booking-resources/:resourceId/send-enquiry` */
export function useSendBookingEnquiryMutation(resourceId: string | undefined) {
  const { client, queryClient } = useNetworkContext();
  const { session } = useUserAuth();
  const id = resourceId?.trim();

  return useMutation<UserBookingDetail, Error, SendBookingEnquiryRequest>({
    mutationFn: async (body) => {
      const token = session?.accessToken;
      if (!id) {
        throw new Error('Missing resource id');
      }
      if (!token) {
        throw new Error('You must be signed in to send an enquiry');
      }

      const response = (await client.post(API_PATHS.user.bookingResourceSendEnquiry(id), body, {
        headers: userBearerHeaders(token),
      })) as { ok?: boolean; data?: UserBookingDetail; message?: string };

      return throwUnlessOk<UserBookingDetail>(response, 'Failed to send booking enquiry');
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['user', 'booking-resources'] });
      void queryClient.invalidateQueries({ queryKey: ['user', 'bookings'] });
    },
  });
}
