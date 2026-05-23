import { format } from 'date-fns';
import { useCallback, useState } from 'react';

import type { BookingStatus } from '@/features/bookings/types';
import type { StaffBookingsListFilterParams } from '@/features/staff-bookings/types';

export const STAFF_BOOKING_FILTER_STATUSES: BookingStatus[] = [
  'DRAFT',
  'PENDING_PAYMENT',
  'PENDING_APPROVAL',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
  'REJECTED',
];

export function createDefaultStaffBookingsFilter(): StaffBookingsListFilterParams {
  const now = new Date();
  return {
    month: format(now, 'MM'),
    year: format(now, 'yyyy'),
    resourceId: null,
    status: null,
    limit: 10,
  };
}

export function countActiveStaffBookingFilters(
  filter: StaffBookingsListFilterParams,
): number {
  const defaults = createDefaultStaffBookingsFilter();
  let count = 0;
  if (filter.resourceId) count++;
  if (filter.status) count++;
  if (filter.month !== defaults.month || filter.year !== defaults.year) count++;
  return count;
}

export type StaffBookingsFilterSelection = {
  filter: StaffBookingsListFilterParams;
  replaceFilter: (next: StaffBookingsListFilterParams) => void;
  resetFilter: () => void;
};

export function useStaffBookingsFilter(
  initial?: Partial<StaffBookingsListFilterParams>,
): StaffBookingsFilterSelection {
  const [filter, setFilter] = useState<StaffBookingsListFilterParams>(() => ({
    ...createDefaultStaffBookingsFilter(),
    ...initial,
  }));

  const replaceFilter = useCallback((next: StaffBookingsListFilterParams) => {
    setFilter(next);
  }, []);

  const resetFilter = useCallback(() => {
    setFilter(createDefaultStaffBookingsFilter());
  }, []);

  return { filter, replaceFilter, resetFilter };
}
