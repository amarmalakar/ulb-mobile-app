import { View } from 'react-native';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { BottomNav } from '@/components/common/bottom-nav';
import { TopNavigation } from '@/components/common/top-navigation';
import { useUserAuth } from '@/components/provider/user-auth-provider';
import { BookingResourceList } from '@/features/bookings/components/booking-resource-list';
import { useUserBookingResourcesQuery } from '@/features/bookings/hooks/use-user-booking-resources-query';

export default function UserBookingListScreen() {
  const { t } = useTranslation();
  const { sessionHydrated, mpinUnlocked } = useUserAuth();
  const bookingResourcesQuery = useUserBookingResourcesQuery({
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
