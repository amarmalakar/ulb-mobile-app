import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { useAuthContext } from '@/components/providers/auth-provider';
import { useNetworkContext } from '@/components/providers/network-provider';
import { useStaffAuth } from '@/components/providers/staff-auth-provider';
import { useUserAuth } from '@/components/providers/user-auth-provider';
import { staffBearerHeaders, throwUnlessOk } from '@/features/staff-auth/utils/api-response';
import { userBearerHeaders } from '@/features/user-auth/utils/api-response';
import { API_PATHS } from '@/lib/api-paths';

import { mapUserFeaturedToItem } from '../lib/featured-utils';
import type { FeaturedApiItem, FeaturedDetailResponse, FeaturedItem } from '../types';

type UseFeaturedDetailQueryOptions = {
  featuredId: string | undefined;
  enabled?: boolean;
};

export function useFeaturedDetailQuery({
  featuredId,
  enabled = true,
}: UseFeaturedDetailQueryOptions) {
  const { client } = useNetworkContext();
  const { authType } = useAuthContext();
  const { session: userSession, sessionHydrated: userHydrated } = useUserAuth();
  const { session: staffSession, sessionHydrated: staffHydrated } = useStaffAuth();
  const { i18n } = useTranslation();

  const isStaff = authType === 'Staff';
  const accessToken = isStaff ? staffSession?.accessToken : userSession?.accessToken;
  const sessionReady = isStaff ? staffHydrated : userHydrated;

  return useQuery<FeaturedItem | null, Error>({
    queryKey: ['featured', 'detail', featuredId, authType ?? 'guest', accessToken, i18n.language],
    enabled:
      Boolean(featuredId && authType && accessToken) &&
      sessionReady &&
      enabled,
    queryFn: async () => {
      const token = accessToken;
      if (!token || !featuredId) {
        throw new Error('Missing auth session or featured id');
      }

      const response = (await client.get(API_PATHS.common.featuredById(featuredId), {
        headers: isStaff ? staffBearerHeaders(token) : userBearerHeaders(token),
      })) as FeaturedDetailResponse;

      const data = throwUnlessOk<FeaturedApiItem>(response, 'Failed to load featured item');

      return mapUserFeaturedToItem(data, i18n.language);
    },
  });
}
