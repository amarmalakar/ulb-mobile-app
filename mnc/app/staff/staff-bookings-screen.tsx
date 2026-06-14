import { useEffect, useMemo } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";
import { Typography } from "@/components/common/typography";
import { Stack, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { TopNavigation } from "@/components/common/top-navigation";
import { useStaffAuth } from "@/components/providers/staff-auth-provider";
import { StaffBookingsNoAccess } from "@/features/bookings/components/staff-bookings-no-access";
import { createDefaultStaffBookingsFilter, parseStaffBookingsScreenParams, useStaffBookingsFilter, type StaffBookingsScreenSearchParams } from "@/features/staff-bookings/hooks/use-staff-bookings-filter";
import { useStaffBookingsInfiniteQuery } from "@/features/staff-bookings/hooks/use-staff-bookings-query";
import { StaffBookingListCard } from "@/features/staff-bookings/components/staff-booking-list-card";
import { UserBookingListLoader, UserBookingListError, UserBookingListEmpty } from "@/app/user/user-your-booking-screen";

function StaffBookingsContent() {
  const { t } = useTranslation();
  const searchParams = useLocalSearchParams<StaffBookingsScreenSearchParams>();
  const { filter, replaceFilter } = useStaffBookingsFilter();

  useEffect(() => {
    const patch = parseStaffBookingsScreenParams(searchParams);
    if (Object.keys(patch).length === 0) return;
    replaceFilter({
      ...createDefaultStaffBookingsFilter(),
      ...patch,
    });
  }, [searchParams.bookingResourceId, replaceFilter]);

  const bookingsQuery = useStaffBookingsInfiniteQuery(filter);
  const bookings = bookingsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const totalBookings = bookingsQuery.data?.pages[0]?.pagination.total;

  const totalLabel = useMemo(() => {
    if (bookingsQuery.isLoading) {
      return t('common.loading');
    }
    if (bookingsQuery.isError) {
      return null;
    }
    const total = totalBookings ?? 0;
    return total === 1
      ? t('bookings.staffListCountOne', { count: total })
      : t('bookings.staffListCountMany', { count: total });
  }, [t, bookingsQuery.isLoading, bookingsQuery.isError, totalBookings]);

  return (
    <View className="flex-1 gap-2 pt-2">
      {totalLabel ? (
        <Typography className="px-4 text-sm font-medium text-muted-foreground">
          {totalLabel}
        </Typography>
      ) : null}

      {bookingsQuery.isLoading ? (
        <UserBookingListLoader />
      ) : bookingsQuery.isError ? (
        <UserBookingListError onRetry={() => void bookingsQuery.refetch()} message={bookingsQuery.error?.message} />
      ) : bookings.length === 0 ? (
        <UserBookingListEmpty />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          className="flex-1"
          contentContainerStyle={{ gap: 12, paddingHorizontal: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (bookingsQuery.hasNextPage && !bookingsQuery.isFetchingNextPage) {
              void bookingsQuery.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            bookingsQuery.isFetchingNextPage ? (
              <View className="items-center py-4">
                <ActivityIndicator />
              </View>
            ) : null
          }
          renderItem={({ item }) => <StaffBookingListCard booking={item} />}
        />
      )}


    </View>
  );
}

export default function StaffBookingsScreen() {
  const { t } = useTranslation();
  const { staffInfo, isStaffInfoLoading } = useStaffAuth();
  const hasBookingsAccess = staffInfo?.access?.includes("BOOKINGS") ?? false;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-background">
        <TopNavigation label={t("nav.bookings")} isBackButton />

        {isStaffInfoLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" />
          </View>
        ) : !hasBookingsAccess ? (
          <StaffBookingsNoAccess />
        ) : (
          <StaffBookingsContent />
        )}
      </View>
    </>
  );
}