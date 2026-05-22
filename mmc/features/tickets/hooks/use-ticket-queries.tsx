import { useMutation } from '@tanstack/react-query';

import { useNetworkContext } from '@/components/provider/network-provider';
import { useUserAuth } from '@/components/provider/user-auth-provider';
import { throwUnlessOk, userBearerHeaders } from '@/features/user-auth/utils/api-response';
import type { UserTicketDetail } from '@/features/tickets/types';

type UserTicketDetailApiResponse = {
  ok: boolean;
  data?: UserTicketDetail;
  message?: string;
};

export type PostUserTicketCommentBody = {
  comment: string;
};

export type PutUserTicketRatingBody = {
  rating: number;
};

/** Adds a citizen comment via `POST /user/tickets/:ticketId/comments`. */
export function usePostUserTicketCommentMutation() {
  const { client, queryClient } = useNetworkContext();
  const { session } = useUserAuth();
  const accessToken = session?.accessToken;

  return useMutation<
    UserTicketDetail,
    Error,
    { ticketId: string; body: PostUserTicketCommentBody }
  >({
    mutationFn: async ({ ticketId, body }) => {
      const token = accessToken;
      if (!token) {
        throw new Error('You must be signed in');
      }
      const res = (await client.post(
        `/user/tickets/${encodeURIComponent(ticketId)}/comments`,
        body,
        { headers: userBearerHeaders(token) },
      )) as UserTicketDetailApiResponse;
      return throwUnlessOk(res, 'Failed to add comment');
    },
    onSuccess: (_data, { ticketId }) => {
      void queryClient.invalidateQueries({ queryKey: ['user', 'tickets'] });
      void queryClient.invalidateQueries({
        queryKey: ['user', 'tickets', 'detail', accessToken, ticketId],
      });
    },
  });
}

/** Sets or updates ticket rating 1–5 via `PUT /user/tickets/:ticketId/rating`. */
export function usePutUserTicketRatingMutation() {
  const { client, queryClient } = useNetworkContext();
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
      const res = (await client.put(
        `/user/tickets/${encodeURIComponent(ticketId)}/rating`,
        body,
        { headers: userBearerHeaders(token) },
      )) as UserTicketDetailApiResponse;
      return throwUnlessOk(res, 'Failed to update ticket rating');
    },
    onSuccess: (_data, { ticketId }) => {
      void queryClient.invalidateQueries({ queryKey: ['user', 'tickets'] });
      void queryClient.invalidateQueries({
        queryKey: ['user', 'tickets', 'detail', accessToken, ticketId],
      });
    },
  });
}
