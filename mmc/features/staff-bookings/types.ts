import type { BookingStatus } from '@/features/bookings/types';

export type StaffBookingListItem = {
  id: string;
  bookingTokenId: string;
  resourceId: string;
  status: BookingStatus;
  contactName: string | null;
  contactPhone: string | null;
  startsAt: string;
  endsAt: string;
  totalAmount: number;
  paidAmount: number;
  createdAt: string;
  resource: {
    id: string;
    name: string;
    type: 'BUILDING' | 'VEHICLE';
    thumbnailUrl: string | null;
  };
};

export type StaffBookingsListData = {
  items: StaffBookingListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    month: string;
    year: string;
    resourceId: string | null;
    status: BookingStatus | null;
  };
};

export type StaffBookingsListFilterParams = {
  month: string;
  year: string;
  resourceId: string | null;
  status: BookingStatus | null;
  limit: number;
};
