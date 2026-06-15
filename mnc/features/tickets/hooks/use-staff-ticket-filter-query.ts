import type { AxiosInstance } from 'axios';
import { useQuery } from '@tanstack/react-query';

import { useNetworkContext } from '@/components/providers/network-provider';
import { useStaffAuth } from '@/components/providers/staff-auth-provider';
import { staffBearerHeaders, throwUnlessOk } from '@/features/staff-auth/utils/api-response';
import { API_PATHS } from '@/lib/api-paths';

import type { StaffTicketFiltersData } from '../types';

type StaffTicketFiltersApiResponse = {
  ok?: boolean;
  data?: StaffTicketFiltersData;
  message?: string;
};

export async function fetchStaffTicketFilters(
  client: AxiosInstance,
  accessToken: string,
): Promise<StaffTicketFiltersData> {
  const response = (await client.get(API_PATHS.staff.ticketFilters, {
    headers: staffBearerHeaders(accessToken),
  })) as StaffTicketFiltersApiResponse;

  return throwUnlessOk(response, 'Failed to load ticket filters');
}

export type UseStaffTicketFilterQueryOptions = {
  enabled?: boolean;
};

/** Loads service filter options from `GET /staff/ticket-filters`. */
export function useStaffTicketFilterQuery(options?: UseStaffTicketFilterQueryOptions) {
  const { client } = useNetworkContext();
  const { session, sessionHydrated, mpinUnlocked } = useStaffAuth();
  const accessToken = session?.accessToken;

  return useQuery<StaffTicketFiltersData, Error>({
    queryKey: ['staff', 'ticket-filters', accessToken],
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

      return fetchStaffTicketFilters(client, token);
    },
  });
}
