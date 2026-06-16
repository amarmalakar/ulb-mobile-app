import type { AxiosInstance } from 'axios';
import { useNetworkContext } from '@/components/providers/network-provider';
import { userQueryKeys } from '@/features/user-auth/query-keys';
import type {
  UserAuthSession,
  UserInfo,
  UserLogoutRequest,
  UserSessionRefreshData,
  UserSessionRefreshRequest,
  UserSigninOtpSendData,
  UserSigninOtpSendRequest,
  UserSigninOtpVerifyRequest,
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

export function useUserSigninOtpSendMutation() {
  const { client } = useNetworkContext();

  return useMutation<UserSigninOtpSendData, Error, UserSigninOtpSendRequest>({
    mutationFn: async (body) => {
      const res = (await client.post(
        API_PATHS.user.signinOtpSend,
        body,
      )) as OkResponse<UserSigninOtpSendData>;
      return throwUnlessOk(res, 'Could not send OTP');
    },
  });
}

export function useUserSigninOtpVerifyMutation() {
  const { client } = useNetworkContext();

  return useMutation<UserAuthSession, Error, UserSigninOtpVerifyRequest>({
    mutationFn: async (body) => {
      const res = (await client.post(
        API_PATHS.user.signinOtpVerify,
        body,
      )) as OkResponse<UserAuthSession>;
      return throwUnlessOk(res, 'Verification failed');
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
