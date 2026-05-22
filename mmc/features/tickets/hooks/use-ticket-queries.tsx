import type { AxiosInstance } from 'axios';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';

import { useNetworkContext } from '@/components/provider/network-provider';
import { useUserAuth } from '@/components/provider/user-auth-provider';
import { throwUnlessOk, userBearerHeaders } from '@/features/user-auth/utils/api-response';
import type { iTicketStatus, UserTicketDetail, UserTicketsPage } from '@/features/tickets/types';

export const USER_TICKETS_DEFAULT_LIMIT = 10;
export const USER_TICKETS_MAX_LIMIT = 50;

type UserTicketsApiResponse = {
  ok: boolean;
  data?: UserTicketsPage;
  message?: string;
};

export type UseUserTicketsInfiniteQueryOptions = {
  ulbId?: string;
  limit?: number;
  enabled?: boolean;
};

export async function fetchUserTicketsPage(
  client: AxiosInstance,
  accessToken: string,
  options: { limit: number; cursor?: string; ulbId?: string },
): Promise<UserTicketsPage> {
  const res = (await client.get('/user/tickets', {
    headers: userBearerHeaders(accessToken),
    params: {
      limit: options.limit,
      ...(options.cursor ? { cursor: options.cursor } : {}),
      ...(options.ulbId ? { ulbId: options.ulbId } : {}),
    },
  })) as UserTicketsApiResponse;

  return throwUnlessOk(res, 'Failed to load tickets');
}

/** Loads the signed-in citizen's tickets from `GET /user/tickets`. */
export function useUserTicketsInfiniteQuery(
  options?: UseUserTicketsInfiniteQueryOptions,
) {
  const { client } = useNetworkContext();
  const { session, sessionHydrated, mpinUnlocked } = useUserAuth();
  const accessToken = session?.accessToken;
  const ulbId = options?.ulbId?.trim();
  const limit = Math.min(
    Math.max(1, options?.limit ?? USER_TICKETS_DEFAULT_LIMIT),
    USER_TICKETS_MAX_LIMIT,
  );

  return useInfiniteQuery<UserTicketsPage, Error>({
    queryKey: ['user', 'tickets', accessToken, ulbId ?? '', limit],
    enabled:
      Boolean(accessToken) &&
      sessionHydrated &&
      mpinUnlocked &&
      (options?.enabled ?? true),
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const token = accessToken;
      if (!token) {
        throw new Error('Missing access token');
      }
      const cursor =
        typeof pageParam === 'string' && pageParam.length > 0 ? pageParam : undefined;
      return fetchUserTicketsPage(client, token, {
        limit,
        cursor,
        ulbId,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.nextCursor ? lastPage.nextCursor : undefined,
  });
}

type UserTicketDetailApiResponse = {
  ok: boolean;
  data?: UserTicketDetail;
  message?: string;
};

export type UseUserTicketQueryOptions = {
  ulbId?: string;
  enabled?: boolean;
};

export async function fetchUserTicketDetail(
  client: AxiosInstance,
  accessToken: string,
  ticketId: string,
  ulbId?: string,
): Promise<UserTicketDetail> {
  const res = (await client.get(`/user/tickets/${encodeURIComponent(ticketId)}`, {
    headers: userBearerHeaders(accessToken),
    ...(ulbId ? { params: { ulbId } } : {}),
  })) as UserTicketDetailApiResponse;

  return throwUnlessOk(res, 'Failed to load ticket');
}

/** Fetches one ticket from `GET /user/tickets/:ticketId`. */
export function useUserTicketQuery(
  ticketId: string | string[] | null | undefined,
  options?: UseUserTicketQueryOptions,
) {
  const { client } = useNetworkContext();
  const { session, sessionHydrated, mpinUnlocked } = useUserAuth();
  const accessToken = session?.accessToken;
  const id = Array.isArray(ticketId) ? ticketId[0]?.trim() : ticketId?.trim();
  const ulbId = options?.ulbId?.trim();

  return useQuery<UserTicketDetail, Error>({
    queryKey: ['user', 'tickets', 'detail', accessToken, ulbId ?? '', id ?? ''],
    enabled:
      Boolean(accessToken && id) &&
      sessionHydrated &&
      mpinUnlocked &&
      (options?.enabled ?? true),
    queryFn: async () => {
      const token = accessToken;
      if (!token || !id) {
        throw new Error('Missing access token or ticket id');
      }
      return fetchUserTicketDetail(client, token, id, ulbId);
    },
  });
}

export type PatchUserTicketStatusBody = {
  status: iTicketStatus;
};

/** Updates ticket status via `PATCH /user/tickets/:ticketId`. */
export function usePatchUserTicketStatusMutation() {
  const { client, queryClient } = useNetworkContext();
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
      const res = (await client.patch(
        `/user/tickets/${encodeURIComponent(ticketId)}`,
        body,
        { headers: userBearerHeaders(token) },
      )) as UserTicketDetailApiResponse;
      return throwUnlessOk(res, 'Failed to update ticket status');
    },
    onSuccess: (_data, { ticketId }) => {
      void queryClient.invalidateQueries({ queryKey: ['user', 'tickets'] });
      void queryClient.invalidateQueries({
        queryKey: ['user', 'tickets', 'detail', accessToken, ticketId],
      });
    },
  });
}

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
