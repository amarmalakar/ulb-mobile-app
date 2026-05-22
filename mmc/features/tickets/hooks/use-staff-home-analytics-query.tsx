import type { AxiosInstance } from 'axios';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { useNetworkContext } from '@/components/provider/network-provider';
import { useStaffAuth } from '@/components/provider/staff-auth-provider';
import { staffBearerHeaders, throwUnlessOk } from '@/features/staff-auth/utils/api-response';
import type { StaffHomeAnalyticsData } from '@/features/tickets/types';

type StaffHomeAnalyticsApiResponse = {
  ok: boolean;
  data?: StaffHomeAnalyticsData;
  message?: string;
};

export type StaffHomeAnalyticsParams = {
  wards: number[];
};

const STALE_TIME_MS = 30_000;

export async function fetchStaffHomeAnalytics(
  client: AxiosInstance,
  accessToken: string,
  params: StaffHomeAnalyticsParams,
): Promise<StaffHomeAnalyticsData> {
  const res = (await client.post('/staff/home-analytics', params, {
    headers: staffBearerHeaders(accessToken),
  })) as StaffHomeAnalyticsApiResponse;

  return throwUnlessOk(res, 'Failed to load home analytics');
}

export function useStaffHomeAnalyticsQuery(
  params: StaffHomeAnalyticsParams,
  options?: { enabled?: boolean },
) {
  const { client } = useNetworkContext();
  const { session, mpinUnlocked } = useStaffAuth();
  const accessToken = session?.accessToken;
  const wardsKey =
    params.wards.length > 0 ? [...params.wards].sort((a, b) => a - b).join(',') : '';

  return useQuery<StaffHomeAnalyticsData, Error>({
    queryKey: ['staff', 'home-analytics', accessToken, wardsKey],
    enabled: Boolean(accessToken) && mpinUnlocked && (options?.enabled ?? true),
    staleTime: STALE_TIME_MS,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const token = accessToken;
      if (!token) {
        throw new Error('Missing access token');
      }
      return fetchStaffHomeAnalytics(client, token, params);
    },
  });
}
