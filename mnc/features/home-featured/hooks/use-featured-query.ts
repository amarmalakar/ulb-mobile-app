import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { useAuthContext } from '@/components/providers/auth-provider';
import { useNetworkContext } from '@/components/providers/network-provider';
import { useStaffAuth } from '@/components/providers/staff-auth-provider';
import { useUserAuth } from '@/components/providers/user-auth-provider';
import { staffBearerHeaders, throwUnlessOk } from '@/features/staff-auth/utils/api-response';
import { userBearerHeaders } from '@/features/user-auth/utils/api-response';
import { API_PATHS } from '@/lib/api-paths';

import { mapUserFeaturedList } from '../lib/featured-utils';
import type { FeaturedApiItem, FeaturedItem, FeaturedListResponse } from '../types';

type UseFeaturedQueryOptions = {
  enabled?: boolean;
};

export function useFeaturedQuery(options?: UseFeaturedQueryOptions) {
  const { client } = useNetworkContext();
  const { authType } = useAuthContext();
  const { session: userSession, sessionHydrated: userHydrated } = useUserAuth();
  const { session: staffSession, sessionHydrated: staffHydrated } = useStaffAuth();
  const { i18n } = useTranslation();

  const isStaff = authType === 'Staff';
  const accessToken = isStaff ? staffSession?.accessToken : userSession?.accessToken;
  const sessionReady = isStaff ? staffHydrated : userHydrated;

  return useQuery<FeaturedItem[], Error>({
    queryKey: ['featured', authType ?? 'guest', accessToken, i18n.language],
    enabled: Boolean(authType && accessToken) && sessionReady && (options?.enabled ?? true),
    queryFn: async () => {
      const token = accessToken;
      if (!token || !authType) {
        throw new Error('Missing auth session');
      }

      const response = (await client.get(API_PATHS.common.featured, {
        headers: isStaff ? staffBearerHeaders(token) : userBearerHeaders(token),
      })) as FeaturedListResponse;

      const data = throwUnlessOk<FeaturedApiItem[]>(response, 'Failed to load featured items');

      return mapUserFeaturedList(data, i18n.language);
    },
  });
}
