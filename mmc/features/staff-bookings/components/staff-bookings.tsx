import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams } from 'expo-router';

import { Text } from '@/components/ui/text';
import { StaffBookingFilter } from '@/features/staff-bookings/components/staff-booking-filter';
import { StaffBookingList } from '@/features/staff-bookings/components/staff-booking-list';
import {
  createDefaultStaffBookingsFilter,
  parseStaffBookingsScreenParams,
  type StaffBookingsScreenSearchParams,
  useStaffBookingsFilter,
} from '@/features/staff-bookings/hooks/use-staff-bookings-filter';
import { useStaffBookingsInfiniteQuery } from '@/features/staff-bookings/hooks/use-staff-bookings-query';

export default function StaffBookings() {
  const { t } = useTranslation();
  const searchParams = useLocalSearchParams<StaffBookingsScreenSearchParams>();
  const { filter, replaceFilter, resetFilter } = useStaffBookingsFilter();

  useEffect(() => {
    const patch = parseStaffBookingsScreenParams(searchParams);
    if (Object.keys(patch).length === 0) return;
    replaceFilter({
      ...createDefaultStaffBookingsFilter(),
      ...patch,
    });
  }, [searchParams.bookingResourceId, replaceFilter]);
  const bookingsQuery = useStaffBookingsInfiniteQuery(filter);

  const totalBookings = bookingsQuery.data?.pages[0]?.pagination.total;

  const totalLabel = useMemo(() => {
    if (bookingsQuery.isLoading) {
      return t('common.loading');
    }
    if (bookingsQuery.isError) {
      return null;
    }
    const total = totalBookings ?? 0;
    return total === 1
      ? t('bookings.staffListCountOne', { count: total })
      : t('bookings.staffListCountMany', { count: total });
  }, [t, bookingsQuery.isLoading, bookingsQuery.isError, totalBookings]);

  return (
    <View className="flex-1 gap-2 pt-2">
      {totalLabel ? (
        <Text className="px-4 text-sm font-medium text-muted-foreground">{totalLabel}</Text>
      ) : null}
      <StaffBookingFilter filter={filter} replaceFilter={replaceFilter} resetFilter={resetFilter} />
      <StaffBookingList bookingsQuery={bookingsQuery} />
    </View>
  );
}
