import type { BookingStatus } from '@/features/bookings/types';

const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  DRAFT: ['PENDING_APPROVAL', 'PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED'],
  PENDING_PAYMENT: ['CONFIRMED', 'CANCELLED'],
  PENDING_APPROVAL: ['CONFIRMED', 'REJECTED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  REJECTED: [],
};

export function getAllowedBookingStatusTransitions(from: BookingStatus): BookingStatus[] {
  return ALLOWED_TRANSITIONS[from] ?? [];
}

export function canRecordBookingPayment(status: BookingStatus): boolean {
  return status !== 'CANCELLED' && status !== 'REJECTED';
}
