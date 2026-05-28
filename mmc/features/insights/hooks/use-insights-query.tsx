import { useQuery } from '@tanstack/react-query';

import { useAuthContext } from '@/components/provider/auth-provider';
import { useNetworkContext } from '@/components/provider/network-provider';
import { useStaffAuth } from '@/components/provider/staff-auth-provider';
import { useUserAuth } from '@/components/provider/user-auth-provider';
import { staffBearerHeaders, throwUnlessOk } from '@/features/staff-auth/utils/api-response';
import { userBearerHeaders } from '@/features/user-auth/utils/api-response';

import type { GetV2InsightsResponse, V2InsightItem } from '../types';

type UseInsightsQueryOptions = {
  enabled?: boolean;
};

export function useInsightsQuery(options?: UseInsightsQueryOptions) {
  const { client } = useNetworkContext();
  const { authType } = useAuthContext();
  const { session: userSession, sessionHydrated: userHydrated, mpinUnlocked: userUnlocked } = useUserAuth();
  const { session: staffSession, sessionHydrated: staffHydrated, mpinUnlocked: staffUnlocked } = useStaffAuth();

  const isStaff = authType === 'Staff';
  const accessToken = isStaff ? staffSession?.accessToken : userSession?.accessToken;
  const sessionReady = isStaff ? staffHydrated && staffUnlocked : userHydrated && userUnlocked;

  return useQuery<V2InsightItem[], Error>({
    queryKey: ['insights', authType ?? 'guest', accessToken],
    enabled: Boolean(authType && accessToken) && sessionReady && (options?.enabled ?? true),
    queryFn: async () => {
      const token = accessToken;
      if (!token || !authType) {
        throw new Error('Missing auth session');
      }

      const response = (await client.get('/insights', {
        headers: isStaff ? staffBearerHeaders(token) : userBearerHeaders(token),
      })) as GetV2InsightsResponse | { ok?: boolean; message?: string };

      const data = throwUnlessOk<{ items: V2InsightItem[] }>(
        response,
        'Failed to load insights',
      );

      return data.items;
    },
  });
}
