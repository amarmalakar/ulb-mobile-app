import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useNetworkContext } from '@/components/providers/network-provider';
import { useUserAuth } from '@/components/providers/user-auth-provider';
import { userBearerHeaders, throwUnlessOk } from '@/features/user-auth/utils/api-response';
import { API_PATHS } from '@/lib/api-paths';

import type { UserTicketDetail } from '../types';

type UserTicketDetailApiResponse = {
  ok?: boolean;
  data?: UserTicketDetail;
  message?: string;
};

export type PostUserTicketCommentBody = {
  comment: string;
};

/** Adds a citizen comment via `POST /user/tickets/:ticketId/comments`. */
export function usePostUserTicketCommentMutation() {
  const { client } = useNetworkContext();
  const queryClient = useQueryClient();
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

      const response = (await client.post(API_PATHS.user.ticketComments(ticketId), body, {
        headers: userBearerHeaders(token),
      })) as UserTicketDetailApiResponse;

      return throwUnlessOk(response, 'Failed to add comment');
    },
    onSuccess: (_data, { ticketId }) => {
      void queryClient.invalidateQueries({ queryKey: ['user', 'tickets'] });
      void queryClient.invalidateQueries({
        queryKey: ['user', 'tickets', 'detail', accessToken, ticketId],
      });
    },
  });
}
