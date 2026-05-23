import { FlatList, View } from 'react-native';
import {
  AlertCircleIcon,
  RefreshCcwIcon,
  SchoolIcon,
} from 'lucide-react-native';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { BookingItem } from '@/features/bookings/components/booking-item';
import type { UserBookingResourceListItem } from '@/features/bookings/types';
import { cn } from '@/lib/utils';

function BookingResourceListSkeleton() {
  return (
    <View className="gap-4 px-4 pt-2">
      {new Array(3).fill(0).map((_, index) => (
        <View key={index} className="overflow-hidden rounded-2xl border border-border bg-card">
          <Skeleton className="h-40 w-full" />
          <View className="gap-2 p-4">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-5 w-1/2" />
          </View>
        </View>
      ))}
    </View>
  );
}

function BookingResourceListError({
  message,
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center gap-4 px-6 py-12">
      <View className="bg-destructive/10 size-20 items-center justify-center rounded-full">
        <Icon as={AlertCircleIcon} className="text-destructive" size={40} />
      </View>
      <View className="gap-1.5">
        <Text className="text-destructive text-center text-lg font-bold">
          {t('common.errorTitle')}
        </Text>
        <Text className="text-muted-foreground text-center text-sm">
          {message ?? t('bookings.loadError')}
        </Text>
      </View>
      <Button size="sm" variant="outline" onPress={onRetry}>
        <Icon as={RefreshCcwIcon} className="size-4" />
        <Text>{t('common.retry')}</Text>
      </Button>
    </View>
  );
}

function BookingResourceListEmpty() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center gap-5 px-6 py-12">
      <View className="bg-muted size-20 items-center justify-center rounded-full">
        <Icon as={SchoolIcon} className="text-muted-foreground" size={40} />
      </View>
      <View className="gap-1.5">
        <Text className="text-foreground text-center text-xl font-bold">
          {t('bookings.emptyTitle')}
        </Text>
        <Text className="text-muted-foreground max-w-[300px] text-center text-sm leading-relaxed">
          {t('bookings.emptyHint')}
        </Text>
      </View>
    </View>
  );
}

export type BookingResourceListProps = {
  query: UseQueryResult<UserBookingResourceListItem[], Error>;
};

export function BookingResourceList({ query }: BookingResourceListProps) {
  const { data, isLoading, isError, error, refetch, isRefetching } = query;
  const items = data ?? [];

  if (isLoading) {
    return <BookingResourceListSkeleton />;
  }

  if (isError) {
    return (
      <BookingResourceListError
        message={error?.message}
        onRetry={() => void refetch()}
      />
    );
  }

  if (items.length === 0) {
    return <BookingResourceListEmpty />;
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      className="flex-1"
      contentContainerClassName={cn('gap-4 px-4 pt-2', 'pb-28')}
      showsVerticalScrollIndicator={false}
      refreshing={isRefetching}
      onRefresh={() => void refetch()}
      renderItem={({ item }) => <BookingItem booking={item} />}
    />
  );
}
