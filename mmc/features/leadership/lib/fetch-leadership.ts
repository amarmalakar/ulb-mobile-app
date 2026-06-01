import type { AxiosInstance } from 'axios';

import { throwUnlessOk } from '@/features/user-auth/utils/api-response';
import type { LeadershipMember } from '@/types/leadership';

type LeadershipApiResponse = {
  ok: boolean;
  data?: LeadershipMember[];
  message?: string;
};

export async function fetchUserLeadership(
  client: AxiosInstance,
  accessToken: string,
  headers: { Authorization: string },
): Promise<LeadershipMember[]> {
  const res = (await client.get('/user/leadership', {
    headers,
  })) as LeadershipApiResponse;

  return throwUnlessOk(res, 'Failed to load leadership');
}

export async function fetchStaffLeadership(
  client: AxiosInstance,
  accessToken: string,
  headers: { Authorization: string },
): Promise<LeadershipMember[]> {
  const res = (await client.get('/staff/leadership', {
    headers,
  })) as LeadershipApiResponse;

  return throwUnlessOk(res, 'Failed to load leadership');
}
