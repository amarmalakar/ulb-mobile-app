export type FeedbackTypeFilter = 'ALL' | 'FEEDBACK' | 'SUGGESTION';

export type FeedbackSubmittedByFilter = 'ALL' | 'STAFF' | 'USER' | 'YOURS';

export type FeedbackSortOrder = 'DESC' | 'ASC';

export type FeedbackAndSuggestionFilterState = {
  type: FeedbackTypeFilter;
  submittedBy: FeedbackSubmittedByFilter;
  sortOrder: FeedbackSortOrder;
};

export function createDefaultFeedbackAndSuggestionFilter(): FeedbackAndSuggestionFilterState {
  return {
    type: 'ALL',
    submittedBy: 'ALL',
    sortOrder: 'DESC',
  };
}

export function countActiveFeedbackAndSuggestionFilters(
  filter: FeedbackAndSuggestionFilterState,
): number {
  const defaults = createDefaultFeedbackAndSuggestionFilter();
  let count = 0;
  if (filter.type !== defaults.type) count += 1;
  if (filter.submittedBy !== defaults.submittedBy) count += 1;
  if (filter.sortOrder !== defaults.sortOrder) count += 1;
  return count;
}
