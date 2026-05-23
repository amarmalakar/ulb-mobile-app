import { Stack } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { TopNavigation } from '@/components/common/top-navigation';
import { BottomNav } from '@/components/common/bottom-nav';
import { useUserAuth } from '@/components/provider/user-auth-provider';
import { UserBookingList } from '@/features/bookings/components/user-booking-list';
import { useUserBookingsInfiniteQuery } from '@/features/bookings/hooks/use-user-bookings-query';

export default function UserYourBookingScreen() {
  const { t } = useTranslation();
  const { sessionHydrated, mpinUnlocked } = useUserAuth();
  const bookingsQuery = useUserBookingsInfiniteQuery({
    limit: 10,
    enabled: sessionHydrated && mpinUnlocked,
  });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-background flex-1 gap-4">
        <TopNavigation label={t('bookings.yourBookings')} isBackButton />
        <UserBookingList bookingsQuery={bookingsQuery} />
        <BottomNav />
      </View>
    </>
  );
}
