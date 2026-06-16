import type { AxiosInstance } from 'axios';
import { useInfiniteQuery } from '@tanstack/react-query';

import { useAuthContext } from '@/components/providers/auth-provider';
import { useNetworkContext } from '@/components/providers/network-provider';
import { useStaffAuth } from '@/components/providers/staff-auth-provider';
import { useUserAuth } from '@/components/providers/user-auth-provider';
import type { FeedbackAndSuggestionFilterState } from '@/features/feedback-and-suggestion-form/hooks/use-feedback-and-suggestion-filters';
import { buildFeedbackListParams } from '@/features/feedback-and-suggestion-form/lib/build-feedback-list-params';
import type { FeedbackAndSuggestionPage } from '@/features/feedback-and-suggestion-form/types';
import { staffBearerHeaders, throwUnlessOk } from '@/features/staff-auth/utils/api-response';
import { userBearerHeaders } from '@/features/user-auth/utils/api-response';
import { API_PATHS } from '@/lib/api-paths';

export const FEEDBACK_LIST_DEFAULT_LIMIT = 10;
export const FEEDBACK_LIST_MAX_LIMIT = 50;

export const FEEDBACK_LIST_QUERY_KEY = 'feedback-and-suggestion' as const;

type FeedbackListApiResponse = {
  ok: boolean;
  data?: FeedbackAndSuggestionPage;
  message?: string;
};

export type UseFeedbackAndSuggestionInfiniteQueryOptions = {
  limit?: number;
  enabled?: boolean;
};

export async function fetchFeedbackAndSuggestionPage(
  client: AxiosInstance,
  accessToken: string,
  filter: FeedbackAndSuggestionFilterState,
  options: { page: number; limit: number },
  isStaff: boolean,
): Promise<FeedbackAndSuggestionPage> {
  const params = buildFeedbackListParams(filter, options);
  const res = (await client.get(API_PATHS.common.feedbackAndSuggestion, {
    headers: isStaff ? staffBearerHeaders(accessToken) : userBearerHeaders(accessToken),
    params,
  })) as FeedbackListApiResponse;

  return throwUnlessOk(res, 'Failed to load feedback');
}

/** `GET /common/feedback-and-suggestion` with `page` / `limit` pagination. */
export function useFeedbackAndSuggestionInfiniteQuery(
  filter: FeedbackAndSuggestionFilterState,
  options?: UseFeedbackAndSuggestionInfiniteQueryOptions,
) {
  const { authType } = useAuthContext();
  const { client } = useNetworkContext();
  const { session: userSession, sessionHydrated: userHydrated } = useUserAuth();
  const { session: staffSession, sessionHydrated: staffHydrated } = useStaffAuth();

  const isStaff = authType === 'Staff';
  const accessToken = isStaff ? staffSession?.accessToken : userSession?.accessToken;
  const sessionHydrated = isStaff ? staffHydrated : userHydrated;

  const limit = Math.min(
    Math.max(1, options?.limit ?? FEEDBACK_LIST_DEFAULT_LIMIT),
    FEEDBACK_LIST_MAX_LIMIT,
  );

  return useInfiniteQuery<FeedbackAndSuggestionPage, Error>({
    queryKey: [
      FEEDBACK_LIST_QUERY_KEY,
      'list',
      isStaff ? 'staff' : 'user',
      accessToken,
      filter.type,
      filter.submittedBy,
      filter.sortOrder,
      limit,
    ],
    enabled:
      Boolean(accessToken) &&
      sessionHydrated &&
      (options?.enabled ?? true),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const token = accessToken;
      if (!token) {
        throw new Error('Missing access token');
      }
      const page = typeof pageParam === 'number' && pageParam > 0 ? pageParam : 1;
      return fetchFeedbackAndSuggestionPage(client, token, filter, { page, limit }, isStaff);
    },
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });
}
