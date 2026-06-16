import type { AxiosInstance } from 'axios';
import { useInfiniteQuery } from '@tanstack/react-query';

import { useNetworkContext } from '@/components/providers/network-provider';
import { useStaffAuth } from '@/components/providers/staff-auth-provider';
import { staffBearerHeaders, throwUnlessOk } from '@/features/staff-auth/utils/api-response';
import { API_PATHS } from '@/lib/api-paths';

import type {
  StaffBookingsListData,
  StaffBookingsListFilterParams,
} from '../types';

type StaffBookingsApiResponse = {
  ok?: boolean;
  data?: StaffBookingsListData;
  message?: string;
};

export const STAFF_BOOKINGS_DEFAULT_LIMIT = 10;
export const STAFF_BOOKINGS_MAX_LIMIT = 50;

function staffBookingsListParams(filter: StaffBookingsListFilterParams, page: number) {
  return {
    page,
    limit: Math.min(Math.max(1, filter.limit), STAFF_BOOKINGS_MAX_LIMIT),
    month: filter.month,
    year: filter.year,
    ...(filter.resourceId ? { resourceId: filter.resourceId } : {}),
    ...(filter.status ? { status: filter.status } : {}),
  };
}

export async function fetchStaffBookingsPage(
  client: AxiosInstance,
  accessToken: string,
  filter: StaffBookingsListFilterParams,
  page: number,
): Promise<StaffBookingsListData> {
  const response = (await client.get(API_PATHS.staff.bookings, {
    headers: staffBearerHeaders(accessToken),
    params: staffBookingsListParams(filter, page),
  })) as StaffBookingsApiResponse;

  return throwUnlessOk(response, 'Failed to load bookings');
}

export type UseStaffBookingsInfiniteQueryOptions = {
  enabled?: boolean;
};

/** Loads staff bookings from `GET /staff/bookings` with offset pagination. */
export function useStaffBookingsInfiniteQuery(
  filter: StaffBookingsListFilterParams,
  options?: UseStaffBookingsInfiniteQueryOptions,
) {
  const { client } = useNetworkContext();
  const { session, sessionHydrated } = useStaffAuth();
  const accessToken = session?.accessToken;

  return useInfiniteQuery<StaffBookingsListData, Error>({
    queryKey: [
      'staff',
      'bookings',
      accessToken,
      filter.month,
      filter.year,
      filter.resourceId,
      filter.status,
      filter.limit,
    ],
    enabled:
      Boolean(accessToken) &&
      sessionHydrated &&
      (options?.enabled ?? true),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const token = accessToken;
      if (!token) {
        throw new Error('Missing access token');
      }
      return fetchStaffBookingsPage(client, token, filter, pageParam as number);
    },
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });
}
