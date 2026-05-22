import type { AxiosInstance } from 'axios';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { useNetworkContext } from '@/components/provider/network-provider';
import { useStaffAuth } from '@/components/provider/staff-auth-provider';
import { staffBearerHeaders, throwUnlessOk } from '@/features/staff-auth/utils/api-response';
import type {
  StaffTicketFiltersData,
  StaffTicketsListFilterParams,
  StaffTicketsPage,
} from '@/features/tickets/types';

type StaffTicketsApiResponse = {
  ok: boolean;
  data?: StaffTicketsPage;
  message?: string;
};

type StaffTicketFiltersApiResponse = {
  ok: boolean;
  data?: StaffTicketFiltersData;
  message?: string;
};

export const STAFF_TICKETS_DEFAULT_LIMIT = 10;
export const STAFF_TICKETS_MAX_LIMIT = 50;

function staffTicketsListParams(filter: StaffTicketsListFilterParams, page: number) {
  return {
    query: filter.query,
    ...(filter.selectedComplaintId ? { complaintId: filter.selectedComplaintId } : {}),
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
  const res = (await client.get('/staff/tickets', {
    headers: staffBearerHeaders(accessToken),
    params: staffTicketsListParams(filter, page),
  })) as StaffTicketsApiResponse;

  return throwUnlessOk(res, 'Failed to load tickets');
}

export type UseStaffTicketsInfiniteQueryOptions = {
  enabled?: boolean;
};

export type UseStaffTicketFilterQueryOptions = {
  enabled?: boolean;
};

export async function fetchStaffTicketFilters(
  client: AxiosInstance,
  accessToken: string,
): Promise<StaffTicketFiltersData> {
  const res = (await client.get('/staff/ticket-filters', {
    headers: staffBearerHeaders(accessToken),
  })) as StaffTicketFiltersApiResponse;

  return throwUnlessOk(res, 'Failed to load ticket filters');
}

/** Loads complaint filter options from `GET /staff/ticket-filters`. */
export function useStaffTicketFilterQuery(
  options?: UseStaffTicketFilterQueryOptions,
) {
  const { client } = useNetworkContext();
  const { session } = useStaffAuth();
  const accessToken = session?.accessToken;

  return useQuery<StaffTicketFiltersData, Error>({
    queryKey: ['staff', 'ticket-filters', accessToken],
    enabled: Boolean(accessToken) && (options?.enabled ?? true),
    queryFn: async () => {
      const token = accessToken;
      if (!token) {
        throw new Error('Missing access token');
      }
      return fetchStaffTicketFilters(client, token);
    },
  });
}

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
      filter.selectedComplaintId,
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
