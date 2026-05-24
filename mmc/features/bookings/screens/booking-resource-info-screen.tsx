import { View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { TopNavigation } from '@/components/common/top-navigation';
import { useAuthContext } from '@/components/provider/auth-provider';
import { useStaffAuth } from '@/components/provider/staff-auth-provider';
import { useUserAuth } from '@/components/provider/user-auth-provider';
import { BookingResourceDetail } from '@/features/bookings/components/booking-resource-detail';
import { useBookingResourceQuery } from '@/features/bookings/hooks/use-booking-resource-query';
import { bookingRoutes } from '@/features/bookings/lib/booking-routes';
import { resourceIdFromParams } from '@/features/bookings/lib/route-params';

export function BookingResourceInfoScreen() {
  const { t } = useTranslation();
  const router = useRouter();
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

  const resourceQuery = useBookingResourceQuery({
    resourceId,
    enabled: sessionReady,
  });

  const navLabel = resourceQuery.data?.name ?? t('bookings.infoTitle');

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-background">
        <TopNavigation label={navLabel} isBackButton />
        <BookingResourceDetail
          query={resourceQuery}
          onBookNow={() => {
            if (!resourceId) return;
            router.push(bookingRoutes.create(resourceId) as never);
          }}
        />
      </View>
    </>
  );
}
