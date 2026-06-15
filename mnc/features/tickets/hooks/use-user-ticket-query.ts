import type { AxiosInstance } from 'axios';
import { useQuery } from '@tanstack/react-query';

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

export type UseUserTicketQueryOptions = {
  enabled?: boolean;
};

export async function fetchUserTicketDetail(
  client: AxiosInstance,
  accessToken: string,
  ticketId: string,
): Promise<UserTicketDetail> {
  const response = (await client.get(API_PATHS.user.ticketById(ticketId), {
    headers: userBearerHeaders(accessToken),
  })) as UserTicketDetailApiResponse;

  return throwUnlessOk(response, 'Failed to load ticket');
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

  return useQuery<UserTicketDetail, Error>({
    queryKey: ['user', 'tickets', 'detail', accessToken, id ?? ''],
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

      return fetchUserTicketDetail(client, token, id);
    },
  });
}
