import type { AxiosInstance } from 'axios';
import { useQuery } from '@tanstack/react-query';

import { useNetworkContext } from '@/components/provider/network-provider';
import { useUserAuth } from '@/components/provider/user-auth-provider';
import { throwUnlessOk, userBearerHeaders } from '@/features/user-auth/utils/api-response';
import type { LeadershipMember } from '@/types/leadership';

type UserLeadershipApiResponse = {
  ok: boolean;
  data?: LeadershipMember[];
  message?: string;
};

export type UseUserLeadershipQueryOptions = {
  enabled?: boolean;
};

export async function fetchUserLeadership(
  client: AxiosInstance,
  accessToken: string,
): Promise<LeadershipMember[]> {
  const res = (await client.get('/user/leadership', {
    headers: userBearerHeaders(accessToken),
  })) as UserLeadershipApiResponse;

  return throwUnlessOk(res, 'Failed to load leadership');
}

/** Loads ULB leadership from `GET /user/leadership`. */
export function useUserLeadershipQuery(options?: UseUserLeadershipQueryOptions) {
  const { client } = useNetworkContext();
  const { session, sessionHydrated, mpinUnlocked } = useUserAuth();
  const accessToken = session?.accessToken;

  return useQuery<LeadershipMember[], Error>({
    queryKey: ['user', 'leadership', accessToken],
    enabled:
      Boolean(accessToken) &&
      sessionHydrated &&
      mpinUnlocked &&
      (options?.enabled ?? true),
    queryFn: async () => {
      const token = accessToken;
      if (!token) {
        throw new Error('Missing access token');
      }
      return fetchUserLeadership(client, token);
    },
  });
}
