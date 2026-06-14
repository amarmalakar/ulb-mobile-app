import { useQuery } from '@tanstack/react-query';

import { useNetworkContext } from '@/components/providers/network-provider';
import { useUserAuth } from '@/components/providers/user-auth-provider';
import { fetchUserServices } from '@/features/service/lib/fetch-services';
import { userBearerHeaders } from '@/features/user-auth/utils/api-response';

import type { UserService } from '../types';

export type UseUserServicesQueryOptions = {
  enabled?: boolean;
};

/** Loads ULB services from `GET /user/services`. */
export function useUserServicesQuery(options?: UseUserServicesQueryOptions) {
  const { client } = useNetworkContext();
  const { session, sessionHydrated, mpinUnlocked } = useUserAuth();
  const accessToken = session?.accessToken;

  return useQuery<UserService[], Error>({
    queryKey: ['user', 'services', accessToken],
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
      return fetchUserServices(client, userBearerHeaders(token));
    },
  });
}
