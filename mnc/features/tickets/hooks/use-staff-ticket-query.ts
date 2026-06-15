import type { AxiosInstance } from 'axios';
import { useQuery } from '@tanstack/react-query';

import { useNetworkContext } from '@/components/providers/network-provider';
import { useStaffAuth } from '@/components/providers/staff-auth-provider';
import { staffBearerHeaders, throwUnlessOk } from '@/features/staff-auth/utils/api-response';
import { API_PATHS } from '@/lib/api-paths';

import type { StaffTicketDetail } from '../types';

type StaffTicketDetailApiResponse = {
  ok?: boolean;
  data?: StaffTicketDetail;
  message?: string;
};

export type UseStaffTicketQueryOptions = {
  enabled?: boolean;
};

export async function fetchStaffTicketDetail(
  client: AxiosInstance,
  accessToken: string,
  ticketId: string,
): Promise<StaffTicketDetail> {
  const response = (await client.get(API_PATHS.staff.ticketById(ticketId), {
    headers: staffBearerHeaders(accessToken),
  })) as StaffTicketDetailApiResponse;

  return throwUnlessOk(response, 'Failed to load ticket');
}

/** Fetches one assigned ticket from `GET /staff/tickets/:ticketId`. */
export function useStaffTicketQuery(
  ticketId: string | string[] | null | undefined,
  options?: UseStaffTicketQueryOptions,
) {
  const { client } = useNetworkContext();
  const { session, sessionHydrated, mpinUnlocked } = useStaffAuth();
  const accessToken = session?.accessToken;
  const id = Array.isArray(ticketId) ? ticketId[0]?.trim() : ticketId?.trim();

  return useQuery<StaffTicketDetail, Error>({
    queryKey: ['staff', 'tickets', 'detail', accessToken, id ?? ''],
    enabled:
      Boolean(accessToken && id) &&
      sessionHydrated &&
      mpinUnlocked &&
      (options?.enabled ?? true),
    queryFn: async () => {
      const token = accessToken;
      if (!token || !id) {
        throw new Error('Missing access token or ticket id');
      }

      return fetchStaffTicketDetail(client, token, id);
    },
  });
}
