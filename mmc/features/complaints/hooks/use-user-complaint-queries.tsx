import type { AxiosInstance } from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';

import { useNetworkContext } from '@/components/provider/network-provider';
import { useUserAuth } from '@/components/provider/user-auth-provider';
import { throwUnlessOk, userBearerHeaders } from '@/features/user-auth/utils/api-response';
import type {
  CreateUserComplaintTicketRequest,
  CreateUserComplaintTicketResult,
  UserComplaintCatalogItem,
} from '@/features/complaints/types';
import { isApiError } from '@/lib/api-client';

type UserComplaintsApiResponse = {
  ok: boolean;
  data?: UserComplaintCatalogItem[];
  message?: string;
};

type CreateUserComplaintTicketApiResponse = {
  ok: boolean;
  data?: CreateUserComplaintTicketResult;
  message?: string;
};

export type UseUserComplaintQueriesOptions = {
  ulbId?: string;
  enabled?: boolean;
};

export async function fetchUserComplaints(
  client: AxiosInstance,
  accessToken: string,
  ulbId?: string,
): Promise<UserComplaintCatalogItem[]> {
  const res = (await client.get('/user/complaints', {
    headers: userBearerHeaders(accessToken),
    ...(ulbId ? { params: { ulbId } } : {}),
  })) as UserComplaintsApiResponse;

  return throwUnlessOk(res, 'Failed to load complaints');
}

/** Loads complaint catalog from `GET /user/complaints`. */
export function useUserComplaintQueries(options?: UseUserComplaintQueriesOptions) {
  const { client } = useNetworkContext();
  const { session, sessionHydrated, mpinUnlocked } = useUserAuth();
  const accessToken = session?.accessToken;
  const ulbId = options?.ulbId?.trim();

  return useQuery<UserComplaintCatalogItem[], Error>({
    queryKey: ['user', 'complaints', accessToken, ulbId ?? ''],
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
      return fetchUserComplaints(client, token, ulbId);
    },
  });
}

async function postUserComplaintTicket(
  client: AxiosInstance,
  url: string,
  accessToken: string,
  body: CreateUserComplaintTicketRequest,
): Promise<CreateUserComplaintTicketResult> {
  const res = (await client.post(url, body, {
    headers: userBearerHeaders(accessToken),
  })) as CreateUserComplaintTicketApiResponse;

  return throwUnlessOk(res, 'Failed to submit complaint');
}

/** Creates a ticket via `POST /user/complaints`. */
export function useCreateUserComplaintTicketMutation() {
  const { client, queryClient, apiBaseUrl } = useNetworkContext();
  const { session } = useUserAuth();
  const accessToken = session?.accessToken;

  return useMutation<
    CreateUserComplaintTicketResult,
    Error,
    CreateUserComplaintTicketRequest
  >({
    mutationFn: async (body) => {
      const token = accessToken;
      if (!token) {
        throw new Error('You must be signed in to submit a complaint');
      }

      try {
        return await postUserComplaintTicket(client, '/user/complaints', token, body);
      } catch (error) {
        if (isApiError(error) && error.status === 404) {
          const base = apiBaseUrl.replace(/\/$/, '');
          const v1Url = base.endsWith('/api/v2')
            ? `${base.replace(/\/api\/v2$/, '/api/v1')}/user/complaints`
            : `${base}/user/complaints`;
          return postUserComplaintTicket(client, v1Url, token, body);
        }
        throw error;
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['user', 'complaints'] });
      void queryClient.invalidateQueries({ queryKey: ['user', 'tickets'] });
    },
  });
}
