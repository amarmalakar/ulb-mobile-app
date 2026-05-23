import { View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { TopNavigation } from '@/components/common/top-navigation';
import { useUserAuth } from '@/components/provider/user-auth-provider';
import { UserBookingDetail } from '@/features/bookings/components/user-booking-detail';
import { useUserBookingQuery } from '@/features/bookings/hooks/use-user-booking-query';

function firstParam(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

export default function UserBookingDetailScreen() {
  const { t } = useTranslation();
  const { bookingId } = useLocalSearchParams<{ bookingId?: string | string[] }>();
  const id = firstParam(bookingId);
  const { sessionHydrated, mpinUnlocked } = useUserAuth();

  const bookingQuery = useUserBookingQuery({
    bookingId: id,
    enabled: sessionHydrated && mpinUnlocked,
  });

  const navLabel = bookingQuery.data?.bookingTokenId ?? t('bookings.bookingDetailTitle');

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-background flex-1">
        <TopNavigation label={navLabel} isBackButton />
        <UserBookingDetail query={bookingQuery} />
      </View>
    </>
  );
}
