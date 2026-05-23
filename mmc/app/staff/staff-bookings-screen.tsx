import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

import { BottomNav } from "@/components/common/bottom-nav";
import { TopNavigation } from "@/components/common/top-navigation";
import { useStaffAuth } from "@/components/provider/staff-auth-provider";
import { StaffBookingsNoAccess } from "@/features/bookings/components/staff-bookings-no-access";
import StaffBookings from "@/features/staff-bookings/components/staff-bookings";

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
        ) : hasBookingsAccess ? (
          <StaffBookings />
        ) : (
          <StaffBookingsNoAccess />
        )}

        <BottomNav activeItemId="home" />
      </View>
    </>
  );
}
