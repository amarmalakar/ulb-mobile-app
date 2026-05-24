import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

import {
  createFeedbackAndSuggestionFormSchema,
  type FeedbackAndSuggestionFormValues,
} from '@/features/feedback-and-suggestion-form/schemas';
import type { FeedbackAndSuggestionKind } from '@/features/feedback-and-suggestion-form/types';
import { i18n } from '@/lib/i18n';

export function useFeedbackAndSuggestionForm(
  defaultKind: FeedbackAndSuggestionKind = 'FEEDBACK',
) {
  const schema = useMemo(() => createFeedbackAndSuggestionFormSchema(), [i18n.language]);

  return useForm<FeedbackAndSuggestionFormValues>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      kind: defaultKind,
      title: '',
      message: '',
    },
  });
}
