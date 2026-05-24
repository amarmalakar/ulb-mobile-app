import { useCreateBookingMutation } from '@/features/bookings/hooks/use-create-booking-mutation';

export { postUserBooking } from '@/features/bookings/hooks/use-create-booking-mutation';

/** @deprecated Prefer `useCreateBookingMutation` (auth-aware). */
export function useCreateUserBookingMutation(resourceId: string | undefined) {
  return useCreateBookingMutation(resourceId);
}
