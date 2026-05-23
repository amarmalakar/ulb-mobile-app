import { ActivityIndicator, FlatList, View } from 'react-native';
import type { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';
import { AlertCircleIcon, CalendarCheckIcon, RefreshCcwIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { StaffBookingListCard } from '@/features/staff-bookings/components/staff-booking-list-card';
import type { StaffBookingsListData } from '@/features/staff-bookings/types';

function StaffBookingListLoader() {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" />
    </View>
  );
}

function StaffBookingListError({
  message,
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center gap-4 p-4">
      <View className="size-20 items-center justify-center rounded-full bg-destructive/10">
        <Icon as={AlertCircleIcon} className="text-destructive" size={40} />
      </View>
      <View className="gap-1.5">
        <Text className="text-center text-lg font-bold text-destructive">
          {t('common.errorTitle')}
        </Text>
        <Text className="text-center text-sm text-muted-foreground">
          {message ?? t('bookings.staffListLoadError')}
        </Text>
      </View>
      <Button size="sm" variant="outline" onPress={onRetry}>
        <Icon as={RefreshCcwIcon} className="size-4" />
        <Text>{t('common.retry')}</Text>
      </Button>
    </View>
  );
}

function StaffBookingListEmpty() {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center gap-5 px-6 py-12">
      <View className="size-20 items-center justify-center rounded-full bg-muted">
        <Icon as={CalendarCheckIcon} className="text-muted-foreground" size={40} />
      </View>
      <View className="gap-1.5">
        <Text className="text-center text-xl font-bold text-foreground">
          {t('bookings.staffListEmptyTitle')}
        </Text>
        <Text className="max-w-[300px] text-center text-sm leading-relaxed text-muted-foreground">
          {t('bookings.staffListEmptyHint')}
        </Text>
      </View>
    </View>
  );
}

export type StaffBookingListProps = {
  bookingsQuery: UseInfiniteQueryResult<InfiniteData<StaffBookingsListData>, Error>;
};

export function StaffBookingList({ bookingsQuery }: StaffBookingListProps) {
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
  } = bookingsQuery;

  const bookings = data?.pages.flatMap((page) => page.items) ?? [];

  if (isLoading) {
    return <StaffBookingListLoader />;
  }

  if (isError) {
    return (
      <StaffBookingListError onRetry={() => void refetch()} message={error?.message} />
    );
  }

  if (bookings.length === 0) {
    return <StaffBookingListEmpty />;
  }

  return (
    <FlatList
      data={bookings}
      keyExtractor={(item) => item.id}
      className="flex-1"
      contentContainerStyle={{ gap: 12, paddingHorizontal: 16, paddingBottom: 112 }}
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
      renderItem={({ item }) => <StaffBookingListCard booking={item} />}
    />
  );
}
