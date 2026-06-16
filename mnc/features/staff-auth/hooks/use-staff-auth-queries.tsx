import type { AxiosInstance } from 'axios';
import { useNetworkContext } from '@/components/providers/network-provider';
import { staffQueryKeys } from '@/features/staff-auth/query-keys';
import type {
  StaffAuthSession,
  StaffInfo,
  StaffLoginMutationData,
  StaffLoginRequest,
  StaffLogoutRequest,
  StaffSessionRefreshData,
  StaffSessionRefreshRequest,
  StaffVerifyRequest,
} from '@/features/staff-auth/types/index';
import {
  staffBearerHeaders,
  throwUnlessOk,
} from '@/features/staff-auth/utils/api-response';
import { API_PATHS } from '@/lib/api-paths';
import { useMutation, useQuery } from '@tanstack/react-query';

type OkResponse<T> = {
  ok: boolean;
  data?: T;
  message?: string;
};

export function useStaffLoginMutation() {
  const { client } = useNetworkContext();

  return useMutation<StaffLoginMutationData, Error, StaffLoginRequest>({
    mutationFn: async (data) => {
      const res = (await client.post(API_PATHS.staff.login, data)) as OkResponse<StaffLoginMutationData>;
      return throwUnlessOk(res, 'Failed to send OTP');
    },
  });
}

export function useStaffVerifyMutation() {
  const { client } = useNetworkContext();

  return useMutation<StaffAuthSession, Error, StaffVerifyRequest>({
    mutationFn: async (data) => {
      const res = (await client.post(API_PATHS.staff.verify, data)) as OkResponse<StaffAuthSession>;
      return throwUnlessOk(res, 'Failed to verify OTP');
    },
  });
}

export function useStaffSessionRefreshMutation() {
  const { client } = useNetworkContext();

  return useMutation<StaffSessionRefreshData, Error, StaffSessionRefreshRequest>({
    mutationFn: async (body) => {
      const res = (await client.post(
        API_PATHS.staff.sessionRefresh,
        body,
      )) as OkResponse<StaffSessionRefreshData>;
      return throwUnlessOk(res, 'Session refresh failed');
    },
  });
}

export function useStaffLogoutMutation() {
  const { client } = useNetworkContext();

  return useMutation<{ ok: true }, Error, StaffLogoutRequest>({
    mutationFn: async (body) => {
      const res = (await client.post(
        API_PATHS.staff.logout,
        body,
      )) as OkResponse<{ ok: true }>;
      return throwUnlessOk(res, 'Logout failed');
    },
  });
}

export async function fetchStaffInfo(
  client: AxiosInstance,
  accessToken: string,
): Promise<StaffInfo> {
  const res = (await client.get(API_PATHS.staff.info, {
    headers: staffBearerHeaders(accessToken),
  })) as OkResponse<StaffInfo>;
  return throwUnlessOk(res, 'Failed to load staff info');
}

export function useStaffInfoQuery(accessToken: string | null | undefined) {
  const { client } = useNetworkContext();

  return useQuery<StaffInfo, Error>({
    queryKey: staffQueryKeys.info(accessToken),
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const token = accessToken;
      if (!token) {
        throw new Error('Missing access token');
      }
      return fetchStaffInfo(client, token);
    },
  });
}
