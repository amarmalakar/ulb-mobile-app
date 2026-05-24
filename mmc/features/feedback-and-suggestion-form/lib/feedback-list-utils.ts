import { format, parseISO } from 'date-fns';

import type { TranslationKey } from '@/locales/keys';
import type { FeedbackAndSuggestionListItem } from '@/features/feedback-and-suggestion-form/types';

export function formatFeedbackDate(iso: string): string {
  try {
    return format(parseISO(iso), 'dd MMM yyyy, h:mm a');
  } catch {
    return iso;
  }
}

export function isFeedbackItemYours(
  item: FeedbackAndSuggestionListItem,
  options?: { currentUserId?: string; currentStaffId?: string },
): boolean {
  return (
    (Boolean(options?.currentUserId) && item.userId === options?.currentUserId) ||
    (Boolean(options?.currentStaffId) && item.staffId === options?.currentStaffId)
  );
}

type Translate = (key: TranslationKey) => string;

export function getFeedbackAuthorLabel(
  item: FeedbackAndSuggestionListItem,
  t: Translate,
  options?: { currentUserId?: string; currentStaffId?: string },
): string {
  if (isFeedbackItemYours(item, options)) {
    return t('feedback.listAuthorYours');
  }
  if (item.user?.name) return item.user.name;
  if (item.staff?.name) return item.staff.name;
  if (item.userId) return t('feedback.listAuthorUser');
  if (item.staffId) return t('feedback.listAuthorStaff');
  return t('feedback.listAuthorUnknown');
}

export function getFeedbackSubmitterRoleLabel(
  item: FeedbackAndSuggestionListItem,
  t: Translate,
  options?: { currentUserId?: string; currentStaffId?: string },
): string {
  if (isFeedbackItemYours(item, options)) {
    return t('feedback.detailRoleYours');
  }
  if (item.staffId) return t('feedback.filters.submittedByStaff');
  if (item.userId) return t('feedback.filters.submittedByUser');
  return t('feedback.listAuthorUnknown');
}
