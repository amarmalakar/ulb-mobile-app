import { View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { TopNavigation } from '@/components/common/top-navigation';
import { StaffBookingDetailView } from '@/features/staff-bookings/components/staff-booking-detail';
import { useStaffBookingQuery } from '@/features/staff-bookings/hooks/use-staff-booking-query';

function firstParam(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

export default function StaffBookingDetailScreen() {
  const { t } = useTranslation();
  const { bookingId } = useLocalSearchParams<{ bookingId?: string | string[] }>();
  const id = firstParam(bookingId);

  const bookingQuery = useStaffBookingQuery({ bookingId: id });
  const navLabel = bookingQuery.data?.bookingTokenId ?? t('bookings.bookingDetailTitle');

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-background">
        <TopNavigation label={navLabel} isBackButton />
        <StaffBookingDetailView query={bookingQuery} />
      </View>
    </>
  );
}
