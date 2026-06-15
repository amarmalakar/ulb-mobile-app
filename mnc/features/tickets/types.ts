import type { LocalizedStringRecord } from '@/lib/i18n/get-locale-string';

export enum TicketCategory {
  SERVICE = 'SERVICE',
}

export type iTicketStatus =
  | 'TODO'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'BLOCKED'
  | 'REOPENED';

export type iTicketCommentAuthorType = 'USER' | 'STAFF' | 'SYSTEM';
export type TicketStatusActor = "USER" | "STAFF" | "ADMIN";

export type StaffTicketsListFilterParams = {
  query: string;
  selectedServiceId: string | null;
  /** Empty = all statuses. */
  selectedStatuses: iTicketStatus[];
  month: string;
  year: string;
  selectedWards: number[];
  limit: number;
};

/** API locale map (`{ en, hi }`) for service and sub-service titles. */
export type LocalizedTitle = LocalizedStringRecord;

export type UserTicketAssignedStaff = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string | null;
  imgProfileUrl: string | null;
  staffPosition: { id: string; name: string };
};

export type TicketListItem = {
  id: string;
  ticketTokenId: string;
  ward: number;
  status: iTicketStatus;
  title: LocalizedTitle;
  description: string;
  ticketCategory: TicketCategory | null;
  dueDateTime: string;
  locationAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  commentEnabled: boolean;
  rating: number | null;
  createdAt: string;
  updatedAt: string;
  complaint: { id: string; title: LocalizedTitle };
  service: { id: string; title: LocalizedTitle };
  subService: { id: string; title: LocalizedTitle };
  assignedStaff: UserTicketAssignedStaff | null;
  images: { id: string; imageUrl: string; imageKey?: string; createdAt: string }[];
};

/** One page from `GET /user/tickets` (cursor pagination). */
export type UserTicketsPage = {
  items: TicketListItem[];
  nextCursor: string | null;
  hasMore: boolean;
};

/** One page from `GET /staff/tickets` (page pagination). */
export type StaffTicketsPage = {
  items: StaffTicketListItem[];
  page: number;
  limit: number;
  hasMore: boolean;
  total: number;
};

export type UserTicketTimelineEntry = {
  id: string;
  ulbId: string;
  ticketTokenId: string;
  description: string;
  occurredAt: string;
  createdAt: string;
};

export type UserTicketComment = {
  id: string;
  ulbId: string;
  ticketTokenId: string;
  comment: string;
  authorType: 'USER' | 'STAFF' | 'SYSTEM';
  authorUserId: string | null;
  authorStaffId: string | null;
  createdAt: string;
  authorUser: { id: string; name: string } | null;
  authorStaff: { id: string; name: string; imgProfileUrl: string | null } | null;
};

export type UserTicketDetailUser = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
};

/** Full ticket from `GET /user/tickets/:ticketId`. */
export type UserTicketDetail = TicketListItem & {
  timelines: UserTicketTimelineEntry[];
  comments: UserTicketComment[];
  user: UserTicketDetailUser;
};

/** Citizen may only reopen a completed ticket. */
export const USER_STATUS_TRANSITIONS: Record<iTicketStatus, iTicketStatus[]> = {
  TODO: [],
  IN_PROGRESS: [],
  BLOCKED: [],
  COMPLETED: ["REOPENED"],
  REOPENED: [],
};

/** Field staff workflow for assigned tickets. */
export const STAFF_STATUS_TRANSITIONS: Record<iTicketStatus, iTicketStatus[]> = {
  TODO: ["IN_PROGRESS", "BLOCKED"],
  IN_PROGRESS: ["COMPLETED", "BLOCKED", "TODO"],
  BLOCKED: ["IN_PROGRESS", "TODO"],
  COMPLETED: [],
  REOPENED: ["IN_PROGRESS", "TODO"],
};

/** Admin panel may override ticket status across the full workflow. */
export const ADMIN_STATUS_TRANSITIONS: Record<iTicketStatus, iTicketStatus[]> = {
  TODO: ["IN_PROGRESS", "COMPLETED", "BLOCKED", "REOPENED"],
  IN_PROGRESS: ["TODO", "COMPLETED", "BLOCKED", "REOPENED"],
  COMPLETED: ["TODO", "IN_PROGRESS", "BLOCKED", "REOPENED"],
  BLOCKED: ["TODO", "IN_PROGRESS", "COMPLETED", "REOPENED"],
  REOPENED: ["TODO", "IN_PROGRESS", "COMPLETED", "BLOCKED"],
};

export function getAllowedTicketStatusTransitions(
  actor: TicketStatusActor,
  from: iTicketStatus,
): iTicketStatus[] {
  const map =
    actor === "USER"
      ? USER_STATUS_TRANSITIONS
      : actor === "ADMIN"
        ? ADMIN_STATUS_TRANSITIONS
        : STAFF_STATUS_TRANSITIONS;
  return map[from] ?? [];
}

/** Staff ticket types (same list shape as citizen tickets from mobile APIs). */
export type StaffTicketAssignedStaff = UserTicketAssignedStaff;

export type StaffTicketListItem = TicketListItem;
export type StaffTicketTimelineEntry = {
  id: string;
  ulbId: string;
  ticketTokenId: string;
  description: string;
  occurredAt: string;
  createdAt: string;
};

export type StaffTicketComment = {
  id: string;
  ulbId: string;
  ticketTokenId: string;
  comment: string;
  authorType: iTicketCommentAuthorType;
  authorUserId: string | null;
  authorStaffId: string | null;
  createdAt: string;
  authorUser: { id: string; name: string } | null;
  authorStaff: { id: string; name: string; imgProfileUrl: string | null } | null;
};

export type StaffTicketDetailUser = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
};

export type StaffTicketDetail = StaffTicketListItem & {
  timelines: StaffTicketTimelineEntry[];
  comments: StaffTicketComment[];
  user: StaffTicketDetailUser;
};

export type StaffServiceFilterOption = {
  id: string;
  title: LocalizedTitle;
};

export type StaffTicketFiltersData = {
  services: StaffServiceFilterOption[];
};