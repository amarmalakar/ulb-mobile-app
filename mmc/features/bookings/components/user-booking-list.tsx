import { ActivityIndicator, FlatList, View } from 'react-native';
import type { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';
import { AlertCircleIcon, CalendarCheckIcon, RefreshCcwIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Typography } from '@/components/ui/typography';
import type { UserBookingListItem, UserBookingsPage } from '@/features/bookings/types';
import { UserBookingListCard } from '@/features/bookings/components/user-booking-list-card';

function UserBookingListLoader() {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" />
    </View>
  );
}

function UserBookingListError({
  message,
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center gap-4 p-4">
      <View className="bg-destructive/10 size-20 items-center justify-center rounded-full">
        <Icon as={AlertCircleIcon} className="text-destructive" size={40} />
      </View>
      <View className="gap-1.5">
        <Typography className="text-destructive text-center text-lg font-bold">
          {t('common.errorTitle')}
        </Typography>
        <Typography className="text-muted-foreground text-center text-sm">
          {message ?? t('bookings.yourBookingsLoadError')}
        </Typography>
      </View>
      <Button size="sm" variant="outline" onPress={onRetry}>
        <Icon as={RefreshCcwIcon} className="size-4" />
        <Typography>{t('common.retry')}</Typography>
      </Button>
    </View>
  );
}

function UserBookingListEmpty() {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center gap-5 px-6 py-12">
      <View className="bg-muted size-20 items-center justify-center rounded-full">
        <Icon as={CalendarCheckIcon} className="text-muted-foreground" size={40} />
      </View>
      <View className="gap-1.5">
        <Typography className="text-foreground text-center text-xl font-bold">
          {t('bookings.yourBookingsEmptyTitle')}
        </Typography>
        <Typography className="text-muted-foreground max-w-[300px] text-center text-sm leading-relaxed">
          {t('bookings.yourBookingsEmptyHint')}
        </Typography>
      </View>
    </View>
  );
}

export type UserBookingListProps = {
  bookingsQuery: UseInfiniteQueryResult<InfiniteData<UserBookingsPage>, Error>;
};

export function UserBookingList({ bookingsQuery }: UserBookingListProps) {
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
    return <UserBookingListLoader />;
  }

  if (isError) {
    return (
      <UserBookingListError
        onRetry={() => void refetch()}
        message={error?.message}
      />
    );
  }

  if (bookings.length === 0) {
    return <UserBookingListEmpty />;
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
      renderItem={({ item }: { item: UserBookingListItem }) => (
        <UserBookingListCard booking={item} />
      )}
    />
  );
}
