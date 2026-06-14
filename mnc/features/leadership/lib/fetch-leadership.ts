import type { AxiosInstance } from 'axios';

import { throwUnlessOk } from '@/features/user-auth/utils/api-response';
import { API_PATHS } from '@/lib/api-paths';
import type { LeadershipMember } from '@/types/leadership';

type LeadershipApiResponse = {
  ok: boolean;
  data?: LeadershipMember[];
  message?: string;
};

export async function fetchUserLeadership(
  client: AxiosInstance,
  headers: { Authorization: string },
): Promise<LeadershipMember[]> {
  const res = (await client.get(API_PATHS.user.leadership, {
    headers,
  })) as LeadershipApiResponse;

  return throwUnlessOk(res, 'Failed to load leadership');
}

export async function fetchStaffLeadership(
  client: AxiosInstance,
  headers: { Authorization: string },
): Promise<LeadershipMember[]> {
  const res = (await client.get(API_PATHS.staff.leadership, {
    headers,
  })) as LeadershipApiResponse;

  return throwUnlessOk(res, 'Failed to load leadership');
}
