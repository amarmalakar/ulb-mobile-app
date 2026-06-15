import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useNetworkContext } from '@/components/providers/network-provider';
import { useUserAuth } from '@/components/providers/user-auth-provider';
import { userBearerHeaders, throwUnlessOk } from '@/features/user-auth/utils/api-response';
import { API_PATHS } from '@/lib/api-paths';

import type { UserTicketDetail, iTicketStatus } from '../types';

type UserTicketDetailApiResponse = {
  ok?: boolean;
  data?: UserTicketDetail;
  message?: string;
};

export type PatchUserTicketStatusBody = {
  status: iTicketStatus;
};

/** Updates ticket status via `PATCH /user/tickets/:ticketId`. */
export function usePatchUserTicketStatusMutation() {
  const { client } = useNetworkContext();
  const queryClient = useQueryClient();
  const { session } = useUserAuth();
  const accessToken = session?.accessToken;

  return useMutation<
    UserTicketDetail,
    Error,
    { ticketId: string; body: PatchUserTicketStatusBody }
  >({
    mutationFn: async ({ ticketId, body }) => {
      const token = accessToken;
      if (!token) {
        throw new Error('You must be signed in');
      }

      const response = (await client.patch(API_PATHS.user.ticketById(ticketId), body, {
        headers: userBearerHeaders(token),
      })) as UserTicketDetailApiResponse;

      return throwUnlessOk(response, 'Failed to update ticket status');
    },
    onSuccess: (_data, { ticketId }) => {
      void queryClient.invalidateQueries({ queryKey: ['user', 'tickets'] });
      void queryClient.invalidateQueries({
        queryKey: ['user', 'tickets', 'detail', accessToken, ticketId],
      });
    },
  });
}

export type PutUserTicketRatingBody = {
  rating: number;
};

/** Sets or updates ticket rating 1–5 via `PUT /user/tickets/:ticketId/rating`. */
export function usePutUserTicketRatingMutation() {
  const { client } = useNetworkContext();
  const queryClient = useQueryClient();
  const { session } = useUserAuth();
  const accessToken = session?.accessToken;

  return useMutation<
    UserTicketDetail,
    Error,
    { ticketId: string; body: PutUserTicketRatingBody }
  >({
    mutationFn: async ({ ticketId, body }) => {
      const token = accessToken;
      if (!token) {
        throw new Error('You must be signed in');
      }

      const response = (await client.put(API_PATHS.user.ticketRating(ticketId), body, {
        headers: userBearerHeaders(token),
      })) as UserTicketDetailApiResponse;

      return throwUnlessOk(response, 'Failed to update ticket rating');
    },
    onSuccess: (_data, { ticketId }) => {
      void queryClient.invalidateQueries({ queryKey: ['user', 'tickets'] });
      void queryClient.invalidateQueries({
        queryKey: ['user', 'tickets', 'detail', accessToken, ticketId],
      });
    },
  });
}
