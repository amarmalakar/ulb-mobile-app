import { View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { TopNavigation } from '@/components/common/top-navigation';
import { useAuthContext } from '@/components/provider/auth-provider';
import { useStaffAuth } from '@/components/provider/staff-auth-provider';
import { useUserAuth } from '@/components/provider/user-auth-provider';
import { BookingFlow } from '@/features/bookings/components/user-booking-flow';
import { resourceIdFromParams } from '@/features/bookings/lib/route-params';

export function BookingCreateScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    resourceId?: string | string[];
    bookingId?: string | string[];
  }>();
  const resourceId = resourceIdFromParams(params);
  const { authType } = useAuthContext();
  const { sessionHydrated: userHydrated, mpinUnlocked: userMpin } = useUserAuth();
  const { sessionHydrated: staffHydrated, mpinUnlocked: staffMpin } = useStaffAuth();

  const sessionReady =
    authType === 'Staff' ? staffHydrated && staffMpin : userHydrated && userMpin;

  if (!resourceId || !sessionReady) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 bg-background" />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-background">
        <TopNavigation label={t('bookings.newBooking')} isBackButton />
        <BookingFlow resourceId={resourceId} />
      </View>
    </>
  );
}
