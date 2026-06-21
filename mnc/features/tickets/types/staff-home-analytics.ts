import type { LocalizedStringRecord } from '@/lib/i18n/get-locale-string';

export type StaffHomeAnalyticsServiceTickets = {
  total: number;
  open: number;
  completed: number;
  blocked: number;
};

export type StaffHomeAnalyticsServiceTicketsByWard = {
  ward: number;
  tickets: number;
};

export type StaffHomeAnalyticsServiceBreakdown = {
  id: string;
  title: LocalizedStringRecord;
  icon: string | null;
  iconPathname: string | null;
  color: string | null;
  open: number;
  ticketsByWards: StaffHomeAnalyticsServiceTicketsByWard[];
};

export type StaffHomeAnalyticsBookingSummary = {
  total: number;
  open: number;
  completed: number;
  cancelled: number;
};

export type StaffHomeAnalyticsBookingResourceBreakdown = {
  id: string;
  title: string;
  featuredImageUrl: string | null;
  open: number;
};

export type StaffHomeAnalyticsData = {
  serviceTickets: StaffHomeAnalyticsServiceTickets;
  services: StaffHomeAnalyticsServiceBreakdown[];
  bookingSummary?: StaffHomeAnalyticsBookingSummary;
  bookingResources?: StaffHomeAnalyticsBookingResourceBreakdown[];
};
