import type { AxiosInstance } from 'axios';
import { useNetworkContext } from '@/components/provider/network-provider';
import { staffQueryKeys } from '@/features/staff-auth/query-keys';
import type {
  StaffAuthSession,
  StaffInfo,
  StaffLoginMutationData,
  StaffLoginRequest,
  StaffMpinOkData,
  StaffMpinResetRequestData,
  StaffMpinStatusData,
  StaffMpinVerifyData,
  StaffVerifyRequest,
} from '@/features/staff-auth/types/index';
import {
  staffBearerHeaders,
  throwUnlessOk,
} from '@/features/staff-auth/utils/api-response';
import { useMutation, useQuery } from '@tanstack/react-query';

type StaffLoginApiResponse = {
  ok: boolean;
  data?: StaffLoginMutationData;
  message?: string;
};

type StaffVerifyApiResponse = {
  ok: boolean;
  data?: StaffAuthSession;
  message?: string;
};

type StaffMpinStatusApiResponse = {
  ok: boolean;
  data?: StaffMpinStatusData;
  message?: string;
};

type StaffMpinSimpleApiResponse = {
  ok: boolean;
  data?: StaffMpinOkData;
  message?: string;
};

type StaffMpinResetRequestApiResponse = {
  ok: boolean;
  data?: StaffMpinResetRequestData;
  message?: string;
};

type StaffMpinVerifyApiResponse = {
  ok: boolean;
  data?: StaffMpinVerifyData;
  message?: string;
};

type StaffInfoApiResponse = {
  ok: boolean;
  data?: StaffInfo;
  message?: string;
};

export function useStaffLoginMutation() {
  const { client } = useNetworkContext();

  return useMutation<StaffLoginMutationData, Error, StaffLoginRequest>({
    mutationFn: async (data) => {
      const res = (await client.post('/staff/login', data)) as StaffLoginApiResponse;
      return throwUnlessOk(res, 'Failed to send OTP');
    },
  });
}

export function useStaffVerifyMutation() {
  const { client } = useNetworkContext();

  return useMutation<StaffAuthSession, Error, StaffVerifyRequest>({
    mutationFn: async (data) => {
      const res = (await client.post('/staff/verify', data)) as StaffVerifyApiResponse;
      return throwUnlessOk(res, 'Failed to verify OTP');
    },
  });
}

export function useStaffMpinStatusQuery(accessToken: string | null | undefined) {
  const { client } = useNetworkContext();

  return useQuery<StaffMpinStatusData, Error>({
    queryKey: staffQueryKeys.mpinStatus(accessToken),
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const token = accessToken;
      if (!token) {
        throw new Error('Missing access token');
      }
      const res = (await client.get('/staff/mpin/status', {
        headers: staffBearerHeaders(token),
      })) as StaffMpinStatusApiResponse;
      return throwUnlessOk(res, 'Failed to load MPIN status');
    },
  });
}

export type StaffMpinSetVariables = {
  accessToken: string;
  mpin: string;
  confirmMpin: string;
};

export function useStaffMpinSetMutation() {
  const { client } = useNetworkContext();

  return useMutation<StaffMpinOkData, Error, StaffMpinSetVariables>({
    mutationFn: async ({ accessToken, mpin, confirmMpin }) => {
      const res = (await client.post(
        '/staff/mpin/set',
        { mpin, confirmMpin },
        { headers: staffBearerHeaders(accessToken) },
      )) as StaffMpinSimpleApiResponse;
      return throwUnlessOk(res, 'Failed to set MPIN');
    },
  });
}

export type StaffMpinVerifyVariables = {
  accessToken: string;
  mpin: string;
};

export function useStaffMpinVerifyMutation() {
  const { client } = useNetworkContext();

  return useMutation<StaffMpinVerifyData, Error, StaffMpinVerifyVariables>({
    mutationFn: async ({ accessToken, mpin }) => {
      const res = (await client.post(
        '/staff/mpin/verify',
        { mpin },
        { headers: staffBearerHeaders(accessToken) },
      )) as StaffMpinVerifyApiResponse;
      return throwUnlessOk(res, 'MPIN verification failed');
    },
  });
}

export type StaffMpinResetRequestVariables = {
  accessToken: string;
};

export function useStaffMpinResetRequestMutation() {
  const { client } = useNetworkContext();

  return useMutation<StaffMpinResetRequestData, Error, StaffMpinResetRequestVariables>({
    mutationFn: async ({ accessToken }) => {
      const res = (await client.post(
        '/staff/mpin/reset/request',
        {},
        { headers: staffBearerHeaders(accessToken) },
      )) as StaffMpinResetRequestApiResponse;
      return throwUnlessOk(res, 'Failed to start MPIN reset');
    },
  });
}

export type StaffMpinResetConfirmVariables = {
  accessToken: string;
  resetToken: string;
  otp: string;
  mpin: string;
  confirmMpin: string;
};

export function useStaffMpinResetConfirmMutation() {
  const { client } = useNetworkContext();

  return useMutation<StaffMpinOkData, Error, StaffMpinResetConfirmVariables>({
    mutationFn: async ({ accessToken, resetToken, otp, mpin, confirmMpin }) => {
      const res = (await client.post(
        '/staff/mpin/reset/confirm',
        { resetToken, otp, mpin, confirmMpin },
        { headers: staffBearerHeaders(accessToken) },
      )) as StaffMpinSimpleApiResponse;
      return throwUnlessOk(res, 'Failed to confirm MPIN reset');
    },
  });
}

export async function fetchStaffInfo(
  client: AxiosInstance,
  accessToken: string,
): Promise<StaffInfo> {
  const res = (await client.get('/staff/info', {
    headers: staffBearerHeaders(accessToken),
  })) as StaffInfoApiResponse;
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
