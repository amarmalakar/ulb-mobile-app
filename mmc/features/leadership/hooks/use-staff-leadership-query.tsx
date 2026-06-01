import { useQuery } from '@tanstack/react-query';

import { useNetworkContext } from '@/components/provider/network-provider';
import { useStaffAuth } from '@/components/provider/staff-auth-provider';
import { staffBearerHeaders } from '@/features/staff-auth/utils/api-response';
import { fetchStaffLeadership } from '@/features/leadership/lib/fetch-leadership';
import type { LeadershipMember } from '@/types/leadership';

export type UseStaffLeadershipQueryOptions = {
  enabled?: boolean;
};

/** Loads ULB leadership from `GET /staff/leadership`. */
export function useStaffLeadershipQuery(options?: UseStaffLeadershipQueryOptions) {
  const { client } = useNetworkContext();
  const { session, sessionHydrated, mpinUnlocked } = useStaffAuth();
  const accessToken = session?.accessToken;

  return useQuery<LeadershipMember[], Error>({
    queryKey: ['staff', 'leadership', accessToken],
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
      return fetchStaffLeadership(client, token, staffBearerHeaders(token));
    },
  });
}
