import type { Href } from 'expo-router';

export const BOOKING_RESOURCE_LIST_ROUTE =
  '/common/booking-resource-list-screen' as const satisfies Href;

export const BOOKING_RESOURCE_INFO_ROUTE =
  '/common/booking-resource-info-screen' as const satisfies Href;

export const BOOKING_CREATE_ROUTE = '/common/booking-create-screen' as const satisfies Href;

export const BOOKING_DETAIL_ROUTE = '/common/booking-detail-screen' as const satisfies Href;

export const STAFF_BOOKINGS_LIST_ROUTE = '/staff/staff-bookings-screen' as const satisfies Href;

export const bookingRoutes = {
  resourceList: BOOKING_RESOURCE_LIST_ROUTE,
  resourceInfo: (resourceId: string) => ({
    pathname: BOOKING_RESOURCE_INFO_ROUTE,
    params: { resourceId },
  }),
  create: (resourceId: string) => ({
    pathname: BOOKING_CREATE_ROUTE,
    params: { resourceId },
  }),
  detail: (bookingId: string) => ({
    pathname: BOOKING_DETAIL_ROUTE,
    params: { bookingId },
  }),
  staffBookingsList: (bookingResourceId?: string) =>
    bookingResourceId
      ? { pathname: STAFF_BOOKINGS_LIST_ROUTE, params: { bookingResourceId } }
      : { pathname: STAFF_BOOKINGS_LIST_ROUTE },
} as const;
