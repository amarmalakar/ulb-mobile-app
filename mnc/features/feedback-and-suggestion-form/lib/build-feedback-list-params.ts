import type {
  FeedbackAndSuggestionFilterState,
  FeedbackSubmittedByFilter,
} from '@/features/feedback-and-suggestion-form/hooks/use-feedback-and-suggestion-filters';

export type FeedbackListRequestParams = {
  page: number;
  limit: number;
  kind?: 'FEEDBACK' | 'SUGGESTION';
  submitter?: 'staff' | 'user' | 'yours';
  sortOrder?: 'asc' | 'desc';
};

function mapSubmitterFilter(
  submittedBy: FeedbackSubmittedByFilter,
): FeedbackListRequestParams['submitter'] | undefined {
  switch (submittedBy) {
    case 'STAFF':
      return 'staff';
    case 'USER':
      return 'user';
    case 'YOURS':
      return 'yours';
    default:
      return undefined;
  }
}

export function buildFeedbackListParams(
  filter: FeedbackAndSuggestionFilterState,
  options: { page: number; limit: number },
): FeedbackListRequestParams {
  const submitter = mapSubmitterFilter(filter.submittedBy);

  return {
    page: options.page,
    limit: options.limit,
    ...(filter.type !== 'ALL' ? { kind: filter.type } : {}),
    ...(submitter ? { submitter } : {}),
    ...(filter.sortOrder === 'ASC' ? { sortOrder: 'asc' } : {}),
  };
}
