import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { PlusIcon } from 'lucide-react-native';

import { TopNavigation } from '@/components/common/top-navigation';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Typography } from '@/components/common/typography';
import { FeedbackAndSuggestionFilters } from '@/features/feedback-and-suggestion-form/components/feedback-and-suggestion-filters';
import { FeedbackAndSuggestionList } from '@/features/feedback-and-suggestion-form/components/feedback-and-suggestion-list';
import { createDefaultFeedbackAndSuggestionFilter } from '@/features/feedback-and-suggestion-form/hooks/use-feedback-and-suggestion-filters';
import { useFeedbackAndSuggestionInfiniteQuery } from '@/features/feedback-and-suggestion-form/hooks/use-feedback-and-suggestion-infinite-query';

export default function FeedbackAndSuggestionScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [filter, setFilter] = useState(createDefaultFeedbackAndSuggestionFilter);
  const listQuery = useFeedbackAndSuggestionInfiniteQuery(filter);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-background">
        <TopNavigation label={t('feedback.title')} />

        <View className="flex-row items-center justify-between gap-2 px-4 py-2">
          <Button
            className="shrink flex-row gap-2"
            onPress={() => router.push('/common/feedback-and-suggestion-create-screen')}
          >
            <Icon as={PlusIcon} className="size-4 text-primary-foreground" />
            <Typography className="font-semibold text-primary-foreground">{t('feedback.create')}</Typography>
          </Button>
          <FeedbackAndSuggestionFilters filter={filter} replaceFilter={setFilter} />
        </View>

        <FeedbackAndSuggestionList filter={filter} listQuery={listQuery} />
      </View>
    </>
  );
}
