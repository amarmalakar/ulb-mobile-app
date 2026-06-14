import { useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import type { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';
import {
  AlertCircleIcon,
  MessageSquareTextIcon,
  RefreshCcwIcon,
  SearchXIcon,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Typography } from '@/components/common/typography';
import { FeedbackAndSuggestionDetailModal } from '@/features/feedback-and-suggestion-form/components/feedback-and-suggestion-detail-modal';
import { FeedbackAndSuggestionListCard } from '@/features/feedback-and-suggestion-form/components/feedback-and-suggestion-list-card';
import { countActiveFeedbackAndSuggestionFilters } from '@/features/feedback-and-suggestion-form/hooks/use-feedback-and-suggestion-filters';
import type { FeedbackAndSuggestionFilterState } from '@/features/feedback-and-suggestion-form/hooks/use-feedback-and-suggestion-filters';
import { useFeedbackAndSuggestionInfiniteQuery } from '@/features/feedback-and-suggestion-form/hooks/use-feedback-and-suggestion-infinite-query';
import type {
  FeedbackAndSuggestionListItem,
  FeedbackAndSuggestionPage,
} from '@/features/feedback-and-suggestion-form/types';

function FeedbackListLoader() {
  return (
    <View className="flex-1 items-center justify-center py-12">
      <ActivityIndicator size="large" />
    </View>
  );
}

function FeedbackListError({
  message,
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center gap-4 px-6 py-12">
      <View className="size-20 items-center justify-center rounded-full bg-destructive/10">
        <Icon as={AlertCircleIcon} className="text-destructive" size={40} />
      </View>
      <View className="gap-1.5">
        <Typography className="text-center text-lg font-bold text-destructive">
          {t('common.errorTitle')}
        </Typography>
        <Typography className="text-center text-sm text-muted-foreground">
          {message ?? t('feedback.listLoadError')}
        </Typography>
      </View>
      <Button size="sm" variant="outline" className="flex-row gap-2" onPress={onRetry}>
        <Icon as={RefreshCcwIcon} className="size-4" />
        <Typography>{t('common.retry')}</Typography>
      </Button>
    </View>
  );
}

function FeedbackListEmpty({ hasActiveFilters }: { hasActiveFilters: boolean }) {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center gap-5 px-6 py-12">
      <View className="size-20 items-center justify-center rounded-full bg-muted">
        <Icon
          as={hasActiveFilters ? SearchXIcon : MessageSquareTextIcon}
          className="text-muted-foreground"
          size={40}
        />
      </View>
      <View className="gap-1.5">
        <Typography className="text-center text-xl font-bold text-foreground">
          {hasActiveFilters ? t('feedback.listFilterEmptyTitle') : t('feedback.listEmptyTitle')}
        </Typography>
        <Typography className="max-w-[300px] text-center text-sm leading-relaxed text-muted-foreground">
          {hasActiveFilters ? t('feedback.listFilterEmptyHint') : t('feedback.listEmpty')}
        </Typography>
      </View>
    </View>
  );
}

export type FeedbackAndSuggestionListProps = {
  filter: FeedbackAndSuggestionFilterState;
  listQuery?: UseInfiniteQueryResult<InfiniteData<FeedbackAndSuggestionPage>, Error>;
};

export function FeedbackAndSuggestionList({
  filter,
  listQuery: listQueryProp,
}: FeedbackAndSuggestionListProps) {
  const internalQuery = useFeedbackAndSuggestionInfiniteQuery(filter);
  const listQuery = listQueryProp ?? internalQuery;

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = listQuery;

  const [selectedItem, setSelectedItem] = useState<FeedbackAndSuggestionListItem | null>(null);
  const items = data?.pages.flatMap((page) => page.items) ?? [];
  const hasActiveFilters = countActiveFeedbackAndSuggestionFilters(filter) > 0;

  if (isLoading) {
    return <FeedbackListLoader />;
  }

  if (isError) {
    return (
      <FeedbackListError onRetry={() => void refetch()} message={error?.message} />
    );
  }

  if (items.length === 0) {
    return <FeedbackListEmpty hasActiveFilters={hasActiveFilters} />;
  }

  return (
    <>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        className="flex-1"
        contentContainerStyle={{ gap: 12, paddingHorizontal: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshing={isRefetching && !isFetchingNextPage}
        onRefresh={() => void refetch()}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            void fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="items-center py-4">
              <ActivityIndicator />
            </View>
          ) : null
        }
        renderItem={({ item }: { item: FeedbackAndSuggestionListItem }) => (
          <FeedbackAndSuggestionListCard item={item} onPress={() => setSelectedItem(item)} />
        )}
      />

      <FeedbackAndSuggestionDetailModal
        item={selectedItem}
        visible={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
}
