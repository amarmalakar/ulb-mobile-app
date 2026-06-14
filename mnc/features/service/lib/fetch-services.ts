import type { AxiosInstance } from 'axios';

import { throwUnlessOk } from '@/features/user-auth/utils/api-response';
import { API_PATHS } from '@/lib/api-paths';

import type { UserService } from '../types';

type UserServicesApiResponse = {
  ok: boolean;
  data?: UserService[];
  message?: string;
};

export async function fetchUserServices(
  client: AxiosInstance,
  headers: { Authorization: string },
): Promise<UserService[]> {
  const res = (await client.get(API_PATHS.user.services, {
    headers,
  })) as UserServicesApiResponse;

  return throwUnlessOk(res, 'Failed to load services');
}
