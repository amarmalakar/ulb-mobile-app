import type { AxiosInstance } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuthContext } from '@/components/provider/auth-provider';
import { useNetworkContext } from '@/components/provider/network-provider';
import { useStaffAuth } from '@/components/provider/staff-auth-provider';
import { useUserAuth } from '@/components/provider/user-auth-provider';
import { FEEDBACK_LIST_QUERY_KEY } from '@/features/feedback-and-suggestion-form/hooks/use-feedback-and-suggestion-infinite-query';
import type {
  CreateFeedbackAndSuggestionRequest,
  FeedbackAndSuggestionRecord,
} from '@/features/feedback-and-suggestion-form/types';
import { staffBearerHeaders, throwUnlessOk } from '@/features/staff-auth/utils/api-response';
import { userBearerHeaders } from '@/features/user-auth/utils/api-response';

type CreateFeedbackAndSuggestionApiResponse = {
  ok: boolean;
  data?: FeedbackAndSuggestionRecord;
  message?: string;
};

async function postFeedbackAndSuggestion(
  client: AxiosInstance,
  accessToken: string,
  body: CreateFeedbackAndSuggestionRequest,
  isStaff: boolean,
): Promise<FeedbackAndSuggestionRecord> {
  const res = (await client.post('/feedback-and-suggestion', body, {
    headers: isStaff ? staffBearerHeaders(accessToken) : userBearerHeaders(accessToken),
  })) as CreateFeedbackAndSuggestionApiResponse;

  return throwUnlessOk(res, 'Failed to submit feedback');
}

/** `POST /feedback-and-suggestion` */
export function useCreateFeedbackAndSuggestionMutation() {
  const { authType } = useAuthContext();
  const { client, queryClient } = useNetworkContext();
  const { session: userSession, userInfo } = useUserAuth();
  const { session: staffSession, staffInfo } = useStaffAuth();
  const isStaff = authType === 'Staff';

  return useMutation<FeedbackAndSuggestionRecord, Error, CreateFeedbackAndSuggestionRequest>({
    mutationFn: async (body) => {
      if (isStaff) {
        const token = staffSession?.accessToken;
        const staffId = staffInfo?.id;
        if (!token) {
          throw new Error('You must be signed in');
        }
        if (!staffId) {
          throw new Error('Staff profile is not loaded yet');
        }
        return postFeedbackAndSuggestion(
          client,
          token,
          { ...body, staffId, userId: undefined },
          true,
        );
      }

      const token = userSession?.accessToken;
      const userId = userInfo?.id;
      if (!token) {
        throw new Error('You must be signed in');
      }
      if (!userId) {
        throw new Error('User profile is not loaded yet');
      }
      return postFeedbackAndSuggestion(
        client,
        token,
        { ...body, userId, staffId: undefined },
        false,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [FEEDBACK_LIST_QUERY_KEY, 'list'] });
    },
  });
}
