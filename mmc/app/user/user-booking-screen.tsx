import { View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { TopNavigation } from '@/components/common/top-navigation';
import { useUserAuth } from '@/components/provider/user-auth-provider';
import { UserBookingFlow } from '@/features/bookings/components/user-booking-flow';

function firstParam(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

export default function UserBookingScreen() {
  const { t } = useTranslation();
  const { bookingId } = useLocalSearchParams<{ bookingId?: string | string[] }>();
  const resourceId = firstParam(bookingId);
  const { sessionHydrated, mpinUnlocked } = useUserAuth();

  if (!resourceId || !sessionHydrated || !mpinUnlocked) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="bg-background flex-1" />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-background flex-1">
        <TopNavigation label={t('bookings.newBooking')} isBackButton />
        <UserBookingFlow resourceId={resourceId} />
      </View>
    </>
  );
}
