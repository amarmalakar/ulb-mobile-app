import { View } from "react-native";
import { Typography } from "@/components/common/typography";
import { useStaffAuth } from "@/components/providers/staff-auth-provider";
import { firstParam } from "@/features/bookings/lib/route-params";
import { useStaffBookingQuery } from "@/features/staff-bookings/hooks/use-staff-booking-query";
import { useTranslation } from "react-i18next";
import { Stack, useLocalSearchParams } from "expo-router";
import { TopNavigation } from "@/components/common/top-navigation";
import { UserBookingDetailEmpty, UserBookingDetailError, UserBookingDetailLoader } from "../user/booking-detail-screen";
import { StaffBookingDetail } from "@/features/staff-bookings/components/staff-booking-detail";

export default function StaffBookingDetailScreen() {
  const { t } = useTranslation();
  const { bookingId } = useLocalSearchParams<{ bookingId?: string | string[] }>();
  const id = firstParam(bookingId);

  const { sessionHydrated: staffHydrated } = useStaffAuth();

  const { data: booking, isLoading, isError, error, refetch } = useStaffBookingQuery({
    bookingId: id,
    enabled: staffHydrated,
  });

  const navLabel = booking?.bookingTokenId ?? t('bookings.bookingDetailTitle');

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-background">
        <TopNavigation label={navLabel} isBackButton />
        {isLoading ? (
          <UserBookingDetailLoader />
        ) : isError ? (
          <UserBookingDetailError message={error?.message} onRetry={() => void refetch()} />
        ) : !booking ? (
          <UserBookingDetailEmpty />
        ) : (
          <StaffBookingDetail booking={booking} />
        )}
      </View>
    </>
  );
}