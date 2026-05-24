import { View } from "react-native";
import { Stack } from "expo-router";

import { useTranslation } from "react-i18next";

import { TopNavigation } from "@/components/common/top-navigation";
import { BottomNav } from "@/components/common/bottom-nav";
import { useStaffAuth } from "@/components/provider/staff-auth-provider";

import { useStaffBookingResourcesQuery } from "@/features/bookings/hooks/use-user-booking-resources-query";
import { BookingResourceList } from "@/features/bookings/components/booking-resource-list";

export default function StaffBookingListScreen() {
  const { t } = useTranslation();
  const { sessionHydrated, mpinUnlocked } = useStaffAuth();
  const bookingResourcesQuery = useStaffBookingResourcesQuery({
    enabled: sessionHydrated && mpinUnlocked,
  });
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-background flex-1">
        <TopNavigation label={t('nav.bookings')} isBackButton={false} />
        <BookingResourceList query={bookingResourcesQuery} />
        <BottomNav activeItemId="booking-list" />
      </View>
    </>
  );
}