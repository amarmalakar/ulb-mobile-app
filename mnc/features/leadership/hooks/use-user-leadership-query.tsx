import { useQuery } from '@tanstack/react-query';

import { useNetworkContext } from '@/components/providers/network-provider';
import { useUserAuth } from '@/components/providers/user-auth-provider';
import { fetchUserLeadership } from '@/features/leadership/lib/fetch-leadership';
import { userBearerHeaders } from '@/features/user-auth/utils/api-response';
import type { LeadershipMember } from '@/types/leadership';

export type UseUserLeadershipQueryOptions = {
  enabled?: boolean;
};

/** Loads ULB leadership from `GET /user/leadership`. */
export function useUserLeadershipQuery(options?: UseUserLeadershipQueryOptions) {
  const { client } = useNetworkContext();
  const { session, sessionHydrated } = useUserAuth();
  const accessToken = session?.accessToken;

  return useQuery<LeadershipMember[], Error>({
    queryKey: ['user', 'leadership', accessToken],
    enabled:
      Boolean(accessToken) &&
      sessionHydrated &&
      (options?.enabled ?? true),
    queryFn: async () => {
      const token = accessToken;
      if (!token) {
        throw new Error('Missing access token');
      }
      return fetchUserLeadership(client, userBearerHeaders(token));
    },
  });
}
