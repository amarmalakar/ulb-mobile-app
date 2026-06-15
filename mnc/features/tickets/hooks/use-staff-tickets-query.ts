import type { AxiosInstance } from 'axios';
import { useInfiniteQuery } from '@tanstack/react-query';

import { useNetworkContext } from '@/components/providers/network-provider';
import { useStaffAuth } from '@/components/providers/staff-auth-provider';
import { staffBearerHeaders, throwUnlessOk } from '@/features/staff-auth/utils/api-response';
import { API_PATHS } from '@/lib/api-paths';

import type { StaffTicketsListFilterParams, StaffTicketsPage } from '../types';

type StaffTicketsApiResponse = {
  ok?: boolean;
  data?: StaffTicketsPage;
  message?: string;
};

export const STAFF_TICKETS_DEFAULT_LIMIT = 10;
export const STAFF_TICKETS_MAX_LIMIT = 50;

function staffTicketsListParams(filter: StaffTicketsListFilterParams, page: number) {
  return {
    query: filter.query,
    ...(filter.selectedServiceId ? { serviceId: filter.selectedServiceId } : {}),
    ...(filter.selectedStatuses.length > 0
      ? { status: filter.selectedStatuses.join(',') }
      : {}),
    month: filter.month,
    year: filter.year,
    ...(filter.selectedWards.length > 0 ? { wards: filter.selectedWards.join(',') } : {}),
    page,
    limit: Math.min(Math.max(1, filter.limit), STAFF_TICKETS_MAX_LIMIT),
  };
}

export async function fetchStaffTicketsPage(
  client: AxiosInstance,
  accessToken: string,
  filter: StaffTicketsListFilterParams,
  page: number,
): Promise<StaffTicketsPage> {
  const response = (await client.get(API_PATHS.staff.tickets, {
    headers: staffBearerHeaders(accessToken),
    params: staffTicketsListParams(filter, page),
  })) as StaffTicketsApiResponse;

  return throwUnlessOk(response, 'Failed to load tickets');
}

export type UseStaffTicketsInfiniteQueryOptions = {
  enabled?: boolean;
};

/** Loads assigned staff tickets from `GET /staff/tickets`. */
export function useStaffTicketsInfiniteQuery(
  filter: StaffTicketsListFilterParams,
  options?: UseStaffTicketsInfiniteQueryOptions,
) {
  const { client } = useNetworkContext();
  const { session, sessionHydrated, mpinUnlocked } = useStaffAuth();
  const accessToken = session?.accessToken;

  return useInfiniteQuery<StaffTicketsPage, Error>({
    queryKey: [
      'staff',
      'tickets',
      accessToken,
      filter.query,
      filter.selectedServiceId,
      filter.selectedStatuses,
      filter.month,
      filter.year,
      filter.selectedWards,
      filter.limit,
    ],
    enabled:
      Boolean(accessToken) &&
      sessionHydrated &&
      mpinUnlocked &&
      (options?.enabled ?? true),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const token = accessToken;
      if (!token) {
        throw new Error('Missing access token');
      }

      return fetchStaffTicketsPage(client, token, filter, pageParam as number);
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  });
}
