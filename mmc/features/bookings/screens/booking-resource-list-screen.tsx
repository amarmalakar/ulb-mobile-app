import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { BottomNav } from '@/components/common/bottom-nav';
import { TopNavigation } from '@/components/common/top-navigation';
import { useAuthContext } from '@/components/provider/auth-provider';
import { useStaffAuth } from '@/components/provider/staff-auth-provider';
import { useUserAuth } from '@/components/provider/user-auth-provider';
import { BookingResourceList } from '@/features/bookings/components/booking-resource-list';
import { StaffBookingsNoAccess } from '@/features/bookings/components/staff-bookings-no-access';
import { useBookingResourcesQuery } from '@/features/bookings/hooks/use-booking-resources-query';

export function BookingResourceListScreen() {
  const { t } = useTranslation();
  const { authType } = useAuthContext();
  const { sessionHydrated: userHydrated, mpinUnlocked: userMpin } = useUserAuth();
  const {
    sessionHydrated: staffHydrated,
    mpinUnlocked: staffMpin,
    staffInfo,
    isStaffInfoLoading,
  } = useStaffAuth();

  const isStaff = authType === 'Staff';
  const sessionReady = isStaff
    ? staffHydrated && staffMpin
    : userHydrated && userMpin;
  const hasBookingsAccess = !isStaff || (staffInfo?.access?.includes('BOOKINGS') ?? false);

  const bookingResourcesQuery = useBookingResourcesQuery({
    enabled: sessionReady && hasBookingsAccess,
  });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-background">
        <TopNavigation label={t('nav.bookings')} isBackButton={false} />

        {isStaff && isStaffInfoLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" />
          </View>
        ) : isStaff && !hasBookingsAccess ? (
          <StaffBookingsNoAccess />
        ) : (
          <BookingResourceList query={bookingResourcesQuery} />
        )}

        <BottomNav activeItemId="booking-list" />
      </View>
    </>
  );
}
