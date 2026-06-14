import type {
  BookableResourceType,
  BookingPricingUnit,
  BookingStatus,
  UserBookingPayment,
  UserBookingStatusHistoryItem,
} from '@/features/bookings/types';

export type StaffBookingResourceImage = {
  id: string;
  url: string;
  sortOrder: number;
  isThumbnail: boolean;
};

export type StaffBookingResourceBuildingDetail = {
  capacity: number | null;
  amenities: string[];
  rulesText: string | null;
};

export type StaffBookingResourceVehicleDetail = {
  registrationNo: string | null;
  vehicleType: string | null;
  seats: number | null;
  fuelType: string | null;
};

export type StaffBookingResourceInfo = {
  id: string;
  type: BookableResourceType;
  pricingUnit: BookingPricingUnit;
  name: string;
  description: string;
  locationAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  unitPrice: number;
  currency: string;
  isFeatured: boolean;
  requiresApproval: boolean;
  minAdvanceHours: number;
  maxDurationDays: number | null;
  maxDurationHours: number | null;
  thumbnailUrl: string | null;
  buildingDetail: StaffBookingResourceBuildingDetail | null;
  vehicleDetail: StaffBookingResourceVehicleDetail | null;
  images: StaffBookingResourceImage[];
};

export type StaffBookingDetail = {
  id: string;
  bookingTokenId: string;
  resourceId: string;
  userId: string;
  startsAt: string;
  endsAt: string;
  status: BookingStatus;
  purpose: string | null;
  guestCount: number | null;
  contactName: string | null;
  contactPhone: string | null;
  unitPriceSnapshot: number;
  quantityUnits: number;
  totalAmount: number;
  notes: string | null;
  approvedByStaffId: string | null;
  approvedAt: string | null;
  rejectedReason: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
  paidAmount: number;
  balance: number;
  resource: StaffBookingResourceInfo;
  history: UserBookingStatusHistoryItem[];
  payments: UserBookingPayment[];
};

export type StaffBookingPaymentCreateInput = {
  type: 'CASH' | 'UPI' | 'CHEQUE' | 'BANK_TRANSFER';
  amount: number;
  takenByAccount?: string;
  message: 'ADVANCE' | 'PARTIAL' | 'FINAL';
  status?: 'PENDING' | 'CLEARED' | 'BOUNCED';
  remarks?: string;
};

export type StaffBookingStatusUpdateInput = {
  status: BookingStatus;
  note?: string;
  rejectedReason?: string;
  cancellationReason?: string;
};

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
