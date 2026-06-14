import type { AxiosInstance } from 'axios';
import { useNetworkContext } from '@/components/providers/network-provider';
import { userQueryKeys } from '@/features/user-auth/query-keys';
import type {
  UserAuthSession,
  UserInfo,
  UserLogoutRequest,
  UserMpinResetConfirmData,
  UserMpinResetConfirmVariables,
  UserMpinResetOtpSendData,
  UserMpinSetData,
  UserMpinSetVariables,
  UserMpinStatusData,
  UserMpinVerifyData,
  UserMpinVerifyVariables,
  UserSessionRefreshData,
  UserSessionRefreshRequest,
  UserSigninRequest,
  UserSignupOtpSendData,
  UserSignupOtpSendRequest,
  UserSignupOtpVerifyRequest,
} from '@/features/user-auth/types/index';
import {
  throwUnlessOk,
  userBearerHeaders,
} from '@/features/user-auth/utils/api-response';
import { API_PATHS } from '@/lib/api-paths';
import { useMutation, useQuery } from '@tanstack/react-query';

type OkResponse<T> = {
  ok: boolean;
  data?: T;
  message?: string;
};

export function useUserSignupOtpSendMutation() {
  const { client } = useNetworkContext();

  return useMutation<UserSignupOtpSendData, Error, UserSignupOtpSendRequest>({
    mutationFn: async (body) => {
      const res = (await client.post(
        API_PATHS.user.signupOtpSend,
        body,
      )) as OkResponse<UserSignupOtpSendData>;
      return throwUnlessOk(res, 'Could not send OTP');
    },
  });
}

export function useUserSignupOtpVerifyMutation() {
  const { client } = useNetworkContext();

  return useMutation<UserAuthSession, Error, UserSignupOtpVerifyRequest>({
    mutationFn: async (body) => {
      const res = (await client.post(
        API_PATHS.user.signupOtpVerify,
        body,
      )) as OkResponse<UserAuthSession>;
      return throwUnlessOk(res, 'Verification failed');
    },
  });
}

export function useUserSigninMutation() {
  const { client } = useNetworkContext();

  return useMutation<UserAuthSession, Error, UserSigninRequest>({
    mutationFn: async (body) => {
      const res = (await client.post(
        API_PATHS.user.signin,
        body,
      )) as OkResponse<UserAuthSession>;
      return throwUnlessOk(res, 'Sign in failed');
    },
  });
}

export function useUserSessionRefreshMutation() {
  const { client } = useNetworkContext();

  return useMutation<UserSessionRefreshData, Error, UserSessionRefreshRequest>({
    mutationFn: async (body) => {
      const res = (await client.post(
        API_PATHS.user.sessionRefresh,
        body,
      )) as OkResponse<UserSessionRefreshData>;
      return throwUnlessOk(res, 'Session refresh failed');
    },
  });
}

export function useUserLogoutMutation() {
  const { client } = useNetworkContext();

  return useMutation<{ ok: true }, Error, UserLogoutRequest>({
    mutationFn: async (body) => {
      const res = (await client.post(
        API_PATHS.user.logout,
        body,
      )) as OkResponse<{ ok: true }>;
      return throwUnlessOk(res, 'Logout failed');
    },
  });
}

export function useUserMpinStatusQuery(accessToken: string | null | undefined) {
  const { client } = useNetworkContext();

  return useQuery<UserMpinStatusData, Error>({
    queryKey: userQueryKeys.mpinStatus(accessToken),
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const token = accessToken;
      if (!token) {
        throw new Error('Missing access token');
      }
      const res = (await client.get(API_PATHS.user.mpinStatus, {
        headers: userBearerHeaders(token),
      })) as OkResponse<UserMpinStatusData>;
      return throwUnlessOk(res, 'Failed to load MPIN status');
    },
  });
}

export function useUserMpinSetMutation() {
  const { client } = useNetworkContext();

  return useMutation<UserMpinSetData, Error, UserMpinSetVariables>({
    mutationFn: async ({ accessToken, mpin, confirmMpin }) => {
      const res = (await client.post(
        API_PATHS.user.mpinSet,
        { mpin, confirmMpin },
        { headers: userBearerHeaders(accessToken) },
      )) as OkResponse<UserMpinSetData>;
      return throwUnlessOk(res, 'Failed to set MPIN');
    },
  });
}

export function useUserMpinVerifyMutation() {
  const { client } = useNetworkContext();

  return useMutation<UserMpinVerifyData, Error, UserMpinVerifyVariables>({
    mutationFn: async ({ mpin, refreshToken, accessToken }) => {
      const res = (await client.post(API_PATHS.user.mpinVerify, {
        mpin,
        refreshToken,
        ...(accessToken ? { accessToken } : {}),
      })) as OkResponse<UserMpinVerifyData>;
      return throwUnlessOk(res, 'MPIN verification failed');
    },
  });
}

export function useUserMpinResetOtpSendMutation() {
  const { client } = useNetworkContext();

  return useMutation<UserMpinResetOtpSendData, Error, { accessToken: string }>({
    mutationFn: async ({ accessToken }) => {
      const res = (await client.post(
        API_PATHS.user.mpinResetOtpSend,
        {},
        { headers: userBearerHeaders(accessToken) },
      )) as OkResponse<UserMpinResetOtpSendData>;
      return throwUnlessOk(res, 'Failed to start MPIN reset');
    },
  });
}

export function useUserMpinResetConfirmMutation() {
  const { client } = useNetworkContext();

  return useMutation<UserMpinResetConfirmData, Error, UserMpinResetConfirmVariables>({
    mutationFn: async ({ resetToken, otp, mpin, confirmMpin }) => {
      const res = (await client.post(API_PATHS.user.mpinResetConfirm, {
        resetToken,
        otp,
        mpin,
        confirmMpin,
      })) as OkResponse<UserMpinResetConfirmData>;
      return throwUnlessOk(res, 'Failed to confirm MPIN reset');
    },
  });
}

export async function fetchUserInfo(
  client: AxiosInstance,
  accessToken: string,
): Promise<UserInfo> {
  const res = (await client.get(API_PATHS.user.info, {
    headers: userBearerHeaders(accessToken),
  })) as OkResponse<UserInfo>;
  return throwUnlessOk(res, 'Failed to load user info');
}

export function useUserInfoQuery(accessToken: string | null | undefined) {
  const { client } = useNetworkContext();

  return useQuery<UserInfo, Error>({
    queryKey: userQueryKeys.info(accessToken),
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const token = accessToken;
      if (!token) {
        throw new Error('Missing access token');
      }
      return fetchUserInfo(client, token);
    },
  });
}
