import { View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { TopNavigation } from '@/components/common/top-navigation';
import { useAuthContext } from '@/components/provider/auth-provider';
import { useStaffAuth } from '@/components/provider/staff-auth-provider';
import { useUserAuth } from '@/components/provider/user-auth-provider';
import { UserBookingDetail } from '@/features/bookings/components/user-booking-detail';
import { useUserBookingQuery } from '@/features/bookings/hooks/use-user-booking-query';
import { firstParam } from '@/features/bookings/lib/route-params';
import { StaffBookingDetailView } from '@/features/staff-bookings/components/staff-booking-detail';
import { useStaffBookingQuery } from '@/features/staff-bookings/hooks/use-staff-booking-query';

export function BookingDetailScreen() {
  const { t } = useTranslation();
  const { bookingId } = useLocalSearchParams<{ bookingId?: string | string[] }>();
  const id = firstParam(bookingId);
  const { authType } = useAuthContext();
  const { sessionHydrated: userHydrated, mpinUnlocked: userMpin } = useUserAuth();
  const { sessionHydrated: staffHydrated, mpinUnlocked: staffMpin } = useStaffAuth();

  const isStaff = authType === 'Staff';
  const sessionReady = isStaff ? staffHydrated && staffMpin : userHydrated && userMpin;

  const userBookingQuery = useUserBookingQuery({
    bookingId: id,
    enabled: !isStaff && sessionReady,
  });
  const staffBookingQuery = useStaffBookingQuery({
    bookingId: id,
    enabled: isStaff && sessionReady,
  });

  const bookingQuery = isStaff ? staffBookingQuery : userBookingQuery;
  const navLabel = bookingQuery.data?.bookingTokenId ?? t('bookings.bookingDetailTitle');

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-background">
        <TopNavigation label={navLabel} isBackButton />
        {isStaff ? (
          <StaffBookingDetailView query={staffBookingQuery} />
        ) : (
          <UserBookingDetail query={userBookingQuery} />
        )}
      </View>
    </>
  );
}
