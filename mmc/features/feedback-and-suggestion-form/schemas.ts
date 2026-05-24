import { z } from 'zod';

import { i18n } from '@/lib/i18n';

import { FEEDBACK_AND_SUGGESTION_KINDS } from '@/features/feedback-and-suggestion-form/types';

export function createFeedbackAndSuggestionFormSchema() {
  return z.object({
    kind: z.enum(FEEDBACK_AND_SUGGESTION_KINDS, {
      error: i18n.t('feedback.validation.kindRequired'),
    }),
    title: z
      .string()
      .trim()
      .min(1, i18n.t('feedback.validation.titleRequired'))
      .max(200, i18n.t('feedback.validation.titleTooLong')),
    message: z
      .string()
      .trim()
      .min(10, i18n.t('feedback.validation.messageTooShort'))
      .max(5000, i18n.t('feedback.validation.messageTooLong')),
  });
}

export type FeedbackAndSuggestionFormValues = z.infer<
  ReturnType<typeof createFeedbackAndSuggestionFormSchema>
>;
