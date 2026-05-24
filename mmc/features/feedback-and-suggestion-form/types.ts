export const FEEDBACK_AND_SUGGESTION_KINDS = ['FEEDBACK', 'SUGGESTION'] as const;

export type FeedbackAndSuggestionKind = (typeof FEEDBACK_AND_SUGGESTION_KINDS)[number];

export type CreateFeedbackAndSuggestionRequest = {
  kind: FeedbackAndSuggestionKind;
  title: string;
  message: string;
  userId?: string;
  staffId?: string;
};

export type FeedbackAndSuggestionRecord = {
  id: string;
  ulbId: string;
  kind: FeedbackAndSuggestionKind;
  title: string;
  message: string;
  userId: string | null;
  staffId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FeedbackAndSuggestionAuthor = {
  id: string;
  name: string;
};

/** Row from `GET /feedback-and-suggestion`. */
export type FeedbackAndSuggestionListItem = {
  id: string;
  ulbId: string;
  kind: FeedbackAndSuggestionKind;
  title: string;
  message: string;
  userId: string | null;
  staffId: string | null;
  createdAt: string;
  updatedAt: string;
  user?: FeedbackAndSuggestionAuthor | null;
  staff?: FeedbackAndSuggestionAuthor | null;
};

export type FeedbackAndSuggestionPage = {
  items: FeedbackAndSuggestionListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
