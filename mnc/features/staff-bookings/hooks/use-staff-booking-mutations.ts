import type { AxiosInstance } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useNetworkContext } from '@/components/providers/network-provider';
import { useStaffAuth } from '@/components/providers/staff-auth-provider';
import type { UserBookingPayment } from '@/features/bookings/types';
import { staffBearerHeaders, throwUnlessOk } from '@/features/staff-auth/utils/api-response';
import { API_PATHS } from '@/lib/api-paths';

import type { StaffBookingPaymentCreateInput, StaffBookingStatusUpdateInput } from '../types';
import type { StaffBookingDetail } from '../types';

type StaffBookingPaymentApiResponse = {
  ok?: boolean;
  data?: UserBookingPayment;
  message?: string;
};

type StaffBookingDetailApiResponse = {
  ok?: boolean;
  data?: StaffBookingDetail;
  message?: string;
};

export async function postStaffBookingPayment(
  client: AxiosInstance,
  accessToken: string,
  bookingId: string,
  body: StaffBookingPaymentCreateInput,
): Promise<UserBookingPayment> {
  const response = (await client.post(
    API_PATHS.staff.bookingPaymentDetails(bookingId),
    body,
    { headers: staffBearerHeaders(accessToken) },
  )) as StaffBookingPaymentApiResponse;

  return throwUnlessOk(response, 'Failed to record payment');
}

export async function postStaffBookingStatusUpdate(
  client: AxiosInstance,
  accessToken: string,
  bookingId: string,
  body: StaffBookingStatusUpdateInput,
): Promise<StaffBookingDetail> {
  const response = (await client.post(
    API_PATHS.staff.bookingUpdateStatus(bookingId),
    body,
    { headers: staffBearerHeaders(accessToken) },
  )) as StaffBookingDetailApiResponse;

  return throwUnlessOk(response, 'Failed to update status');
}

export function useStaffBookingPaymentMutation(bookingId: string) {
  const { client } = useNetworkContext();
  const queryClient = useQueryClient();
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
        queryKey: ['staff', 'bookings', 'detail', bookingId, accessToken],
      });
    },
  });
}

export function useStaffBookingStatusMutation(bookingId: string) {
  const { client } = useNetworkContext();
  const queryClient = useQueryClient();
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
        ['staff', 'bookings', 'detail', bookingId, accessToken],
        data,
      );
      void queryClient.invalidateQueries({ queryKey: ['staff', 'bookings'] });
    },
  });
}
