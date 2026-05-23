import { View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { TopNavigation } from '@/components/common/top-navigation';
import { useUserAuth } from '@/components/provider/user-auth-provider';
import { BookingResourceDetail } from '@/features/bookings/components/booking-resource-detail';
import { useUserBookingResourceQuery } from '@/features/bookings/hooks/use-user-booking-resource-query';

function firstParam(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

export default function UserBookingInfoScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId?: string | string[] }>();
  const resourceId = firstParam(bookingId);
  const { sessionHydrated, mpinUnlocked } = useUserAuth();

  const resourceQuery = useUserBookingResourceQuery({
    resourceId,
    enabled: sessionHydrated && mpinUnlocked,
  });

  const navLabel = resourceQuery.data?.name ?? t('bookings.infoTitle');

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
              pathname: '/user/user-booking-screen' as never,
              params: { bookingId: resourceId },
            });
          }}
        />
      </View>
    </>
  );
}
