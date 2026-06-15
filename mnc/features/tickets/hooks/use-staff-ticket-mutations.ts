import type { AxiosInstance } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useNetworkContext } from '@/components/providers/network-provider';
import { useStaffAuth } from '@/components/providers/staff-auth-provider';
import { staffBearerHeaders, throwUnlessOk } from '@/features/staff-auth/utils/api-response';
import { API_PATHS } from '@/lib/api-paths';

import type { StaffTicketDetail, iTicketStatus } from '../types';

type StaffTicketDetailApiResponse = {
  ok?: boolean;
  data?: StaffTicketDetail;
  message?: string;
};

export type PatchStaffTicketStatusBody = {
  status: iTicketStatus;
};

export async function patchStaffTicketStatus(
  client: AxiosInstance,
  accessToken: string,
  ticketId: string,
  body: PatchStaffTicketStatusBody,
): Promise<StaffTicketDetail> {
  const response = (await client.patch(API_PATHS.staff.ticketById(ticketId), body, {
    headers: staffBearerHeaders(accessToken),
  })) as StaffTicketDetailApiResponse;

  return throwUnlessOk(response, 'Failed to update ticket status');
}

/** Updates ticket status via `PATCH /staff/tickets/:ticketId`. */
export function usePatchStaffTicketStatusMutation() {
  const { client } = useNetworkContext();
  const queryClient = useQueryClient();
  const { session } = useStaffAuth();
  const accessToken = session?.accessToken;

  return useMutation<
    StaffTicketDetail,
    Error,
    { ticketId: string; body: PatchStaffTicketStatusBody }
  >({
    mutationFn: async ({ ticketId, body }) => {
      const token = accessToken;
      if (!token) {
        throw new Error('You must be signed in');
      }

      return patchStaffTicketStatus(client, token, ticketId, body);
    },
    onSuccess: (_data, { ticketId }) => {
      void queryClient.invalidateQueries({ queryKey: ['staff', 'tickets'] });
      void queryClient.invalidateQueries({
        queryKey: ['staff', 'tickets', 'detail', accessToken, ticketId],
      });
    },
  });
}

export type PostStaffTicketCommentBody = {
  comment: string;
};

export async function postStaffTicketComment(
  client: AxiosInstance,
  accessToken: string,
  ticketId: string,
  body: PostStaffTicketCommentBody,
): Promise<StaffTicketDetail> {
  const response = (await client.post(API_PATHS.staff.ticketComments(ticketId), body, {
    headers: staffBearerHeaders(accessToken),
  })) as StaffTicketDetailApiResponse;

  return throwUnlessOk(response, 'Failed to add comment');
}

/** Adds a staff comment via `POST /staff/tickets/:ticketId/comments`. */
export function usePostStaffTicketCommentMutation() {
  const { client } = useNetworkContext();
  const queryClient = useQueryClient();
  const { session } = useStaffAuth();
  const accessToken = session?.accessToken;

  return useMutation<
    StaffTicketDetail,
    Error,
    { ticketId: string; body: PostStaffTicketCommentBody }
  >({
    mutationFn: async ({ ticketId, body }) => {
      const token = accessToken;
      if (!token) {
        throw new Error('You must be signed in');
      }

      return postStaffTicketComment(client, token, ticketId, body);
    },
    onSuccess: (_data, { ticketId }) => {
      void queryClient.invalidateQueries({ queryKey: ['staff', 'tickets'] });
      void queryClient.invalidateQueries({
        queryKey: ['staff', 'tickets', 'detail', accessToken, ticketId],
      });
    },
  });
}
