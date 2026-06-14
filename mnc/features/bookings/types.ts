export type BookableResourceType = 'BUILDING' | 'VEHICLE';
export type BookingPricingUnit = 'DAY' | 'HOUR';

export type UserBookingResourceImage = {
  id: string;
  url: string;
  sortOrder: number;
  isThumbnail: boolean;
};

export type UserBookingResourceBuildingDetail = {
  capacity: number | null;
  amenities: string[];
  rulesText: string | null;
};

export type UserBookingResourceVehicleDetail = {
  registrationNo: string | null;
  vehicleType: string | null;
  seats: number | null;
  fuelType: string | null;
};

/** Detail from `GET /user/booking-resources/:resourceId`. */
export type UserBookingResourceDetail = {
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
  buildingDetail: UserBookingResourceBuildingDetail | null;
  vehicleDetail: UserBookingResourceVehicleDetail | null;
  images: UserBookingResourceImage[];
};

/** Row from `GET /user/booking-resources`. */
export type BookingStatus =
  | 'DRAFT'
  | 'PENDING_PAYMENT'
  | 'PENDING_APPROVAL'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

export type BookingActorType = 'USER' | 'STAFF' | 'SYSTEM';
export type BookingPaymentType = 'CASH' | 'UPI' | 'CHEQUE' | 'BANK_TRANSFER';
export type BookingPaymentMessage = 'ADVANCE' | 'PARTIAL' | 'FINAL';
export type BookingPaymentStatus = 'PENDING' | 'CLEARED' | 'BOUNCED';

export type UserBookingPayment = {
  id: string;
  type: BookingPaymentType;
  amount: number;
  takenByStaffId: string | null;
  takenByStaffName: string | null;
  takenByAccount: string | null;
  message: BookingPaymentMessage;
  status: BookingPaymentStatus;
  remarks: string | null;
  createdAt: string;
};

export type UserBookingStatusHistoryItem = {
  id: string;
  status: BookingStatus;
  actorType: BookingActorType;
  actorUserId: string | null;
  actorStaffId: string | null;
  note: string | null;
  createdAt: string;
};

export type UserResourceScheduleOccupancy = {
  id: string;
  startsAt: string;
  endsAt: string;
  status: BookingStatus;
};

export type UserResourceScheduleBlock = {
  id: string;
  startsAt: string;
  endsAt: string;
  reason: string | null;
};

export type UserBookingResourceScheduleMeta = {
  id: string;
  name: string;
  type: BookableResourceType;
  pricingUnit: BookingPricingUnit;
  unitPrice: number;
  currency: string;
  requiresApproval: boolean;
  minAdvanceHours: number;
  maxDurationDays: number | null;
  maxDurationHours: number | null;
};

export type UserBookingResourceSchedule = {
  resource: UserBookingResourceScheduleMeta;
  from: string;
  to: string;
  bookings: UserResourceScheduleOccupancy[];
  blocks: UserResourceScheduleBlock[];
};

export type CreateUserBookingRequest = {
  startsAt: string;
  endsAt: string;
  durationDays?: number;
  purpose?: string;
  guestCount?: number;
  notes?: string;
  contactName?: string;
  contactPhone?: string;
};

export type UserBookingResourceSummary = {
  id: string;
  name: string;
  type: BookableResourceType;
  pricingUnit: BookingPricingUnit;
  locationAddress: string | null;
  thumbnailUrl: string | null;
};

/** Row from `GET /user/bookings`. */
export type UserBookingListItem = {
  id: string;
  bookingTokenId: string;
  resourceId: string;
  startsAt: string;
  endsAt: string;
  status: BookingStatus;
  purpose: string | null;
  guestCount: number | null;
  totalAmount: number;
  paidAmount: number;
  createdAt: string;
  resource: UserBookingResourceSummary;
};

export type UserBookingsPage = {
  items: UserBookingListItem[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type UserBookingDetail = {
  id: string;
  bookingTokenId: string;
  resourceId: string;
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
  createdAt: string;
};

/** Detail from `GET /user/bookings/:bookingId`. */
export type UserBookingByIdDetail = UserBookingDetail & {
  resource: UserBookingResourceSummary;
  paidAmount: number;
  balance: number;
  history: UserBookingStatusHistoryItem[];
  payments: UserBookingPayment[];
};

export type UserBookingResourceListItem = {
  id: string;
  type: BookableResourceType;
  pricingUnit: BookingPricingUnit;
  name: string;
  description: string;
  locationAddress: string | null;
  unitPrice: number;
  currency: string;
  isFeatured: boolean;
  requiresApproval: boolean;
  minAdvanceHours: number;
  maxDurationDays: number | null;
  maxDurationHours: number | null;
  thumbnailUrl: string | null;
};
