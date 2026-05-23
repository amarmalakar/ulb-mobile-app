import type { AxiosInstance } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useNetworkContext } from '@/components/provider/network-provider';
import { useStaffAuth } from '@/components/provider/staff-auth-provider';
import { staffBearerHeaders, throwUnlessOk } from '@/features/staff-auth/utils/api-response';
import type {
  StaffBookingDetail,
  StaffBookingPaymentCreateInput,
  StaffBookingStatusUpdateInput,
} from '@/features/staff-bookings/types';
import type { UserBookingPayment } from '@/features/bookings/types';

type StaffBookingDetailApiResponse = {
  ok: boolean;
  data?: StaffBookingDetail;
  message?: string;
};

type StaffBookingPaymentApiResponse = {
  ok: boolean;
  data?: UserBookingPayment;
  message?: string;
};

export async function postStaffBookingPayment(
  client: AxiosInstance,
  accessToken: string,
  bookingId: string,
  body: StaffBookingPaymentCreateInput,
): Promise<UserBookingPayment> {
  const res = (await client.post(
    `/staff/bookings/${encodeURIComponent(bookingId)}/payment-details`,
    body,
    { headers: staffBearerHeaders(accessToken) },
  )) as StaffBookingPaymentApiResponse;

  return throwUnlessOk(res, 'Failed to record payment');
}

export async function postStaffBookingStatusUpdate(
  client: AxiosInstance,
  accessToken: string,
  bookingId: string,
  body: StaffBookingStatusUpdateInput,
): Promise<StaffBookingDetail> {
  const res = (await client.post(
    `/staff/bookings/${encodeURIComponent(bookingId)}/update-status`,
    body,
    { headers: staffBearerHeaders(accessToken) },
  )) as StaffBookingDetailApiResponse;

  return throwUnlessOk(res, 'Failed to update status');
}

export function useStaffBookingPaymentMutation(bookingId: string) {
  const { client, queryClient } = useNetworkContext();
  const { session } = useStaffAuth();
  const accessToken = session?.accessToken;

  return useMutation({
    mutationFn: async (body: StaffBookingPaymentCreateInput) => {
      const token = accessToken;
      if (!token) {
        throw new Error('Missing access token');
      }
      return postStaffBookingPayment(client, token, bookingId, body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['staff', 'bookings'] });
      void queryClient.invalidateQueries({
        queryKey: ['staff', 'bookings', 'detail', accessToken, bookingId],
      });
    },
  });
}

export function useStaffBookingStatusMutation(bookingId: string) {
  const { client, queryClient } = useNetworkContext();
  const { session } = useStaffAuth();
  const accessToken = session?.accessToken;

  return useMutation({
    mutationFn: async (body: StaffBookingStatusUpdateInput) => {
      const token = accessToken;
      if (!token) {
        throw new Error('Missing access token');
      }
      return postStaffBookingStatusUpdate(client, token, bookingId, body);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ['staff', 'bookings', 'detail', accessToken, bookingId],
        data,
      );
      void queryClient.invalidateQueries({ queryKey: ['staff', 'bookings'] });
    },
  });
}
