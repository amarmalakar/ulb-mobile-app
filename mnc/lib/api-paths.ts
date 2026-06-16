/** Mobile API paths (relative to `/mobile/v1` base URL). */
export const API_PATHS = {
  user: {
    signupOtpSend: '/auth/user/signup/otp/send',
    signupOtpVerify: '/auth/user/signup/otp/verify',
    signinOtpSend: '/auth/user/signin/otp/send',
    signinOtpVerify: '/auth/user/signin/otp/verify',
    sessionRefresh: '/auth/user/session/refresh',
    logout: '/auth/user/logout',
    info: '/user/info',
    leadership: '/user/leadership',
    services: '/user/services',
    tickets: '/user/tickets',
    ticketById: (ticketId: string) =>
      `/user/tickets/${encodeURIComponent(ticketId)}`,
    ticketRating: (ticketId: string) =>
      `/user/tickets/${encodeURIComponent(ticketId)}/rating`,
    ticketComments: (ticketId: string) =>
      `/user/tickets/${encodeURIComponent(ticketId)}/comments`,
    mediaUpload: '/user/media/upload',
    bookingResources: '/user/booking-resources',
    bookingResourceById: (resourceId: string) =>
      `/user/booking-resources/${encodeURIComponent(resourceId)}`,
    bookingResourceSchedule: (resourceId: string) =>
      `/user/booking-resources/${encodeURIComponent(resourceId)}/schedule`,
    bookingResourceSendEnquiry: (resourceId: string) =>
      `/user/booking-resources/${encodeURIComponent(resourceId)}/send-enquiry`,
    bookings: '/user/bookings',
    bookingById: (bookingId: string) =>
      `/user/bookings/${encodeURIComponent(bookingId)}`,
  },
  staff: {
    login: '/auth/staff/login',
    verify: '/auth/staff/verify',
    sessionRefresh: '/auth/staff/session/refresh',
    logout: '/auth/staff/logout',
    info: '/staff/info',
    leadership: '/staff/leadership',
    bookings: '/staff/bookings',
    bookingById: (bookingId: string) =>
      `/staff/bookings/${encodeURIComponent(bookingId)}`,
    bookingPaymentDetails: (bookingId: string) =>
      `/staff/bookings/${encodeURIComponent(bookingId)}/payment-details`,
    bookingUpdateStatus: (bookingId: string) =>
      `/staff/bookings/${encodeURIComponent(bookingId)}/update-status`,
    ticketById: (ticketId: string) =>
      `/staff/tickets/${encodeURIComponent(ticketId)}`,
    ticketComments: (ticketId: string) =>
      `/staff/tickets/${encodeURIComponent(ticketId)}/comments`,
    ticketFilters: '/staff/ticket-filters',
    tickets: '/staff/tickets',
    homeAnalytics: '/staff/home-analytics',
  },
  common: {
    feedbackAndSuggestion: '/common/feedback-and-suggestion',
    insights: '/common/insights',
    insightById: (insightId: string) => `/common/insights/${insightId}`,
  },
} as const;
