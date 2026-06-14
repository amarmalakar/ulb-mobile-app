import type { TranslationKey } from '@/lib/i18n/locales/keys';
import type { BookingStatus } from '@/features/bookings/types';

type StatusStyle = {
  labelKey: TranslationKey;
  badgeClass: string;
  textClass: string;
};

const STATUS_CONFIG: Record<BookingStatus, StatusStyle> = {
  DRAFT: {
    labelKey: 'bookings.statusDraft',
    badgeClass: 'bg-muted',
    textClass: 'text-muted-foreground',
  },
  PENDING_PAYMENT: {
    labelKey: 'bookings.statusPendingPayment',
    badgeClass: 'bg-amber-100',
    textClass: 'text-amber-800',
  },
  PENDING_APPROVAL: {
    labelKey: 'bookings.statusPendingApproval',
    badgeClass: 'bg-amber-100',
    textClass: 'text-amber-800',
  },
  CONFIRMED: {
    labelKey: 'bookings.statusConfirmed',
    badgeClass: 'bg-emerald-100',
    textClass: 'text-emerald-800',
  },
  COMPLETED: {
    labelKey: 'bookings.statusCompleted',
    badgeClass: 'bg-sky-100',
    textClass: 'text-sky-800',
  },
  CANCELLED: {
    labelKey: 'bookings.statusCancelled',
    badgeClass: 'bg-destructive/15',
    textClass: 'text-destructive',
  },
  REJECTED: {
    labelKey: 'bookings.statusRejected',
    badgeClass: 'bg-destructive/15',
    textClass: 'text-destructive',
  },
};

export function getBookingStatusConfig(status: BookingStatus): StatusStyle {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;
}
