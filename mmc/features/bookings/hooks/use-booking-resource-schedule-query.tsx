import { useAuthContext } from '@/components/provider/auth-provider';
import type { UserBookingResourceSchedule } from '@/features/bookings/types';
import { useStaffBookingResourceScheduleQuery } from '@/features/staff-bookings/hooks/use-staff-booking-resource-schedule-query';
import { useUserBookingResourceScheduleQuery } from '@/features/bookings/hooks/use-user-booking-resource-schedule-query';

export type UseBookingResourceScheduleQueryOptions = {
  resourceId: string | undefined;
  from: string | undefined;
  to: string | undefined;
  enabled?: boolean;
};

/** Schedule for booking flow — user or staff API based on `authType`. */
export function useBookingResourceScheduleQuery(options: UseBookingResourceScheduleQueryOptions) {
  const { authType } = useAuthContext();
  const isStaff = authType === 'Staff';

  const userQuery = useUserBookingResourceScheduleQuery({
    ...options,
    enabled: !isStaff && (options.enabled ?? true),
  });

  const staffQuery = useStaffBookingResourceScheduleQuery({
    ...options,
    enabled: isStaff && (options.enabled ?? true),
  });

  return isStaff ? staffQuery : userQuery;
}

export type { UserBookingResourceSchedule };
