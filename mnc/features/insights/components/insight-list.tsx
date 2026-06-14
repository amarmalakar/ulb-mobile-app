import type { UseQueryResult } from '@tanstack/react-query';
import { AlertCircleIcon, NewspaperIcon, RefreshCcwIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { FlatList, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Typography } from '@/components/common/typography';

import type { V2InsightItem } from '../types';
import { InsightListCard } from './insight-list-card';

function InsightsListSkeleton() {
  return (
    <View className="gap-4 px-4 py-3">
      {new Array(3).fill(0).map((_, index) => (
        <View key={index} className="overflow-hidden rounded-2xl border border-border bg-card">
          <Skeleton className="h-44 w-full" />
          <View className="gap-2 p-4">
            <Skeleton className="h-5 w-2/5" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </View>
        </View>
      ))}
    </View>
  );
}

function InsightsListError({ message, onRetry }: { message?: string; onRetry: () => void }) {
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
          {message ?? t('insights.loadError')}
        </Typography>
      </View>
      <Button size="sm" variant="outline" onPress={onRetry}>
        <Icon as={RefreshCcwIcon} className="size-4" />
        <Typography>{t('common.retry')}</Typography>
      </Button>
    </View>
  );
}

function InsightsListEmpty() {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center gap-5 px-6 py-12">
      <View className="size-20 items-center justify-center rounded-full bg-muted">
        <Icon as={NewspaperIcon} className="text-muted-foreground" size={38} />
      </View>
      <View className="gap-1.5">
        <Typography className="text-center text-xl font-bold text-foreground">
          {t('insights.emptyTitle')}
        </Typography>
        <Typography className="max-w-[300px] text-center text-sm leading-relaxed text-muted-foreground">
          {t('insights.emptyHint')}
        </Typography>
      </View>
    </View>
  );
}

export function InsightList({ query }: { query: UseQueryResult<V2InsightItem[], Error> }) {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch, isRefetching } = query;
  const items = data ?? [];

  if (isLoading) {
    return <InsightsListSkeleton />;
  }

  if (isError) {
    return <InsightsListError message={error?.message} onRetry={() => void refetch()} />;
  }

  if (items.length === 0) {
    return <InsightsListEmpty />;
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      className="flex-1"
      contentContainerClassName="gap-4 px-4 py-3 pb-28"
      showsVerticalScrollIndicator={false}
      refreshing={isRefetching}
      onRefresh={() => void refetch()}
      renderItem={({ item }) => (
        <InsightListCard
          item={item}
          onPress={(id) =>
            router.push({
              pathname: '/common/insight-info-screen',
              params: { insightId: id },
            })
          }
        />
      )}
    />
  );
}
