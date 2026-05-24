import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { TopNavigation } from "@/components/common/top-navigation";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useStaffAuth } from "@/components/provider/staff-auth-provider";
import { useStaffBookingResourceQuery } from "@/features/bookings/hooks/use-user-booking-resource-query";
import { BookingResourceDetail } from "@/features/bookings/components/booking-resource-detail";

function firstParam(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

export default function StaffBookingInfoScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId?: string | string[] }>();
  const resourceId = firstParam(bookingId);
  const { sessionHydrated, mpinUnlocked } = useStaffAuth();

  const resourceQuery = useStaffBookingResourceQuery({
    resourceId,
    enabled: sessionHydrated && mpinUnlocked,
  });


  const navLabel = resourceQuery.data?.name ?? t('bookings.infoTitle');
  // const navLabel = t('bookings.infoTitle');
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-background flex-1">
        <TopNavigation label={navLabel} isBackButton />
        <BookingResourceDetail
          query={resourceQuery}
          onBookNow={() => {
            if (!resourceId) return;
            router.push({
              pathname: '/staff/staff-booking-screen',
              params: { bookingId: resourceId },
            });
          }}
        />
      </View>
    </>
  );
}