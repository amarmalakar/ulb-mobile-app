import { Stack, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { TopNavigation } from '@/components/common/top-navigation';
import { BottomNav } from '@/components/common/bottom-nav';
import { useUserAuth } from '@/components/providers/user-auth-provider';
import { useUserBookingsInfiniteQuery } from '@/features/bookings/hooks/use-user-bookings-query';
import { Typography } from '@/components/common/typography';
import { Icon } from '@/components/ui/icon';
import { AlertCircleIcon, Building2Icon, CalendarCheckIcon, CalendarRangeIcon, CarIcon, HashIcon, RefreshCcwIcon } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { UserBookingListItem } from '@/features/bookings/types';
import { Image } from 'expo-image';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { resolveTicketImageUrl } from '@/lib/resolve-ticket-image-url';
import { getBookingStatusConfig } from '@/features/bookings/lib/booking-status';

const THUMB_SIZE = 72;

function formatAmount(amount: number): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(amount);
}

function UserBookingListLoader() {
  return (
    <View className="flex-1 gap-3 px-4 pb-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <View className="overflow-hidden rounded-2xl border border-border bg-card p-4" key={index}>
          <View className="flex-row gap-3">
            <Skeleton
              style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
              className="rounded-xl"
            />
            <View className="min-w-0 flex-1 gap-1.5">
              <View className="flex-row items-start justify-between gap-2">
                <Skeleton className="h-5 flex-1 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-md" />
              </View>
              <Skeleton className="h-3 w-24 rounded-md" />
              <Skeleton className="h-3 w-40 rounded-md" />
              <Skeleton className="h-3 w-32 rounded-md" />
              <View className="mt-1 flex-row items-center justify-between">
                <Skeleton className="h-4 w-20 rounded-md" />
                <Skeleton className="h-3 w-16 rounded-md" />
              </View>
            </View>
          </View>
        </View>
      ))}
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

function UserBookingListCard({ booking }: { booking: UserBookingListItem }) {
  const { t } = useTranslation();
  const router = useRouter();
  const statusConfig = getBookingStatusConfig(booking.status);
  const TypeIcon = booking.resource.type === 'VEHICLE' ? CarIcon : Building2Icon;
  const thumbnailUri = booking.resource.thumbnailUrl
    ? resolveTicketImageUrl(booking.resource.thumbnailUrl)
    : null;

  return (
    <Pressable
      className="active:opacity-90"
      onPress={() => {
        router.push({
          pathname: '/user/booking-detail-screen',
          params: { bookingId: booking.id },
        });
      }}
    >
      <View className="overflow-hidden rounded-2xl border border-border bg-card p-4">
        <View className="flex-row gap-3">
          <View
            style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
            className="overflow-hidden rounded-xl bg-muted"
          >
            {thumbnailUri ? (
              <Image
                source={{ uri: thumbnailUri }}
                style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
                contentFit="cover"
              />
            ) : (
              <View className="h-full w-full items-center justify-center">
                <Icon as={TypeIcon} className="text-muted-foreground" size={28} />
              </View>
            )}
          </View>

          <View className="min-w-0 flex-1 gap-1.5">
            <View className="flex-row items-start justify-between gap-2">
              <Typography className="flex-1 text-base font-semibold text-foreground" numberOfLines={2}>
                {booking.resource.name}
              </Typography>
              <Badge className={cn('rounded-md px-2 py-0.5', statusConfig.badgeClass)}>
                <Typography className={cn('text-[11px] font-semibold', statusConfig.textClass)}>
                  {t(statusConfig.labelKey)}
                </Typography>
              </Badge>
            </View>

            <View className="flex-row items-center gap-1">
              <Icon as={HashIcon} className="text-muted-foreground size-3.5" />
              <Typography className="text-muted-foreground text-xs font-medium">
                {booking.bookingTokenId}
              </Typography>
            </View>

            <View className="flex-row items-center gap-1">
              <Icon as={CalendarRangeIcon} className="text-muted-foreground size-3.5" />
              <Typography className="text-muted-foreground text-xs">
                {format(parseISO(booking.startsAt), 'dd MMM yyyy')}
                {' - '}
                {format(parseISO(booking.endsAt), 'dd MMM yyyy')}
              </Typography>
            </View>

            {booking.purpose ? (
              <Typography className="text-muted-foreground text-xs" numberOfLines={1}>
                {booking.purpose}
              </Typography>
            ) : null}

            <View className="mt-1 flex-row items-center justify-between">
              <Typography className="text-primary text-sm font-bold">
                {t('bookings.totalAmount', { amount: formatAmount(booking.totalAmount) })}
              </Typography>
              {booking.paidAmount > 0 ? (
                <Typography className="text-muted-foreground text-xs">
                  {t('bookings.paidAmount', { amount: formatAmount(booking.paidAmount) })}
                </Typography>
              ) : null}
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}


export default function UserYourBookingScreen() {
  const { t } = useTranslation();
  const { sessionHydrated, mpinUnlocked } = useUserAuth();
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
  } = useUserBookingsInfiniteQuery({
    limit: 10,
    enabled: sessionHydrated && mpinUnlocked,
  });

  const bookings = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-background flex-1 gap-4">
        <TopNavigation label={t('bookings.yourBookings')} isBackButton />
        {isLoading ? (
          <UserBookingListLoader />
        ) : isError ? (
          <UserBookingListError
            onRetry={() => void refetch()}
            message={error?.message}
          />
        ) : bookings.length === 0 ? (
          <UserBookingListEmpty />
        ) : (
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
        )}
        {/* <UserBookingList bookingsQuery={bookingsQuery} /> */}
        <BottomNav />
      </View>
    </>
  );
}