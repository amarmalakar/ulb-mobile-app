import { Stack } from "expo-router";
import { FlatList, View } from "react-native";
import { useTranslation } from "react-i18next";

import { TopNavigation } from "@/components/common/top-navigation";
import { BottomNav } from "@/components/common/bottom-nav";
import { useUserAuth } from "@/components/providers/user-auth-provider";
import { useUserBookingResourcesQuery } from "@/features/bookings/hooks/use-booking-resources-query";
import { Typography } from "@/components/common/typography";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { AlertCircleIcon, RefreshCcwIcon, SchoolIcon } from "lucide-react-native";
import { BookingItem } from "@/features/bookings/components/booking-item";
import { cn } from "@/lib/utils";

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
        <Typography className="text-destructive text-center text-lg font-bold">
          {t('common.errorTitle')}
        </Typography>
        <Typography className="text-muted-foreground text-center text-sm">
          {message ?? t('bookings.loadError')}
        </Typography>
      </View>
      <Button size="sm" variant="outline" onPress={onRetry}>
        <Icon as={RefreshCcwIcon} className="size-4" />
        <Typography>{t('common.retry')}</Typography>
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
        <Typography className="text-foreground text-center text-xl font-bold">
          {t('bookings.emptyTitle')}
        </Typography>
        <Typography className="text-muted-foreground max-w-[300px] text-center text-sm leading-relaxed">
          {t('bookings.emptyHint')}
        </Typography>
      </View>
    </View>
  );
}

export default function BookingResourceListScreen() {
  const { t } = useTranslation();
  const { sessionHydrated } = useUserAuth();
  const sessionReady = sessionHydrated;

  const { data, isPending, isError, error, refetch, isRefetching, isFetched } = useUserBookingResourcesQuery({
    enabled: sessionReady,
  });
  const items = data ?? [];
  const showSkeleton = !sessionReady || (isPending && !isFetched);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-background">
        <TopNavigation label={t('nav.bookings')} isBackButton={false} />

        {showSkeleton ? (
          <BookingResourceListSkeleton />
        ) : isError ? (
          <BookingResourceListError message={error?.message} onRetry={() => void refetch()} />
        ) : items.length === 0 ? (
          <BookingResourceListEmpty />
        ) : (
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
        )}

        <BottomNav activeItemId="booking-list" />
      </View>
    </>
  );
}
