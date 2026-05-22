export interface iApiSuccess<T> {
  ok: true;
  data: T;
}

export interface iApiError {
  ok: false;
  message: string;
}

/** Offset pagination metadata for list UIs (page numbers, totals). */
export interface iPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Mirrors `TicketCategory` in `packages/db/postgres/prisma/ticket.prisma`. */
export enum TicketCategory {
  COMPLIANT = "COMPLIANT",
}

export type iTicketStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "BLOCKED"
  | "REOPENED";

export type TicketStatusActor = "USER" | "STAFF" | "ADMIN";

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

export function isTicketStatusTransitionAllowed(
  actor: TicketStatusActor,
  from: iTicketStatus,
  to: iTicketStatus,
): boolean {
  if (from === to) return true;
  return getAllowedTicketStatusTransitions(actor, from).includes(to);
}

/** One row from `GET /api/tickets` (admin list table). */
export interface iAdminTicketListItem {
  ticketTokenId: string;
  ward: number;
  status: iTicketStatus;
  title: string;
  dueDateTime: string;
  createdAt: string;
  complaint: { title: string };
}

/** Alias mirrors `iAdminComplaint`. */
export type iAdminTicket = iAdminTicketListItem;

export interface iAdminTicketsListData {
  items: iAdminTicketListItem[];
  pagination: iPagination;
}

export interface iAdminTicketsListResponse {
  ok: boolean;
  data: iAdminTicketsListData;
}

export interface iAdminTicketFilterOption {
  id: string;
  label: string;
}

export interface iAdminTicketFiltersData {
  complaints: iAdminTicketFilterOption[];
  staff: iAdminTicketFilterOption[];
}

export interface iAdminTicketFiltersResponse {
  ok: boolean;
  data: iAdminTicketFiltersData;
}

export type iTicketCommentAuthorType = "USER" | "STAFF" | "SYSTEM";

export interface iAdminTicketDetailStaff {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string | null;
  imgProfileUrl: string | null;
  staffPosition: { id: string; name: string };
}

export interface iAdminTicketDetailUser {
  id: string;
  name: string;
  phone: string;
  email: string | null;
}

export interface iAdminTicketDetailImage {
  id: string;
  imageUrl: string;
  createdAt: string;
}

export interface iAdminTicketDetailTimeline {
  id: string;
  description: string;
  occurredAt: string;
  createdAt: string;
}

export interface iAdminTicketDetailComment {
  id: string;
  comment: string;
  authorType: iTicketCommentAuthorType;
  authorUserId: string | null;
  authorStaffId: string | null;
  createdAt: string;
  authorUser: { id: string; name: string } | null;
  authorStaff: { id: string; name: string; imgProfileUrl: string | null } | null;
}

/** Full ticket payload from `GET /api/tickets/[ticketId]` (`ticketId` = `ticketTokenId`). */
export interface iAdminTicketDetail {
  id: string;
  ticketTokenId: string;
  ward: number;
  status: iTicketStatus;
  title: string;
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
  complaint: { id: string; title: string };
  assignedStaff: iAdminTicketDetailStaff | null;
  user: iAdminTicketDetailUser;
  images: iAdminTicketDetailImage[];
  timelines: iAdminTicketDetailTimeline[];
  comments: iAdminTicketDetailComment[];
}

export interface iAdminTicketDetailResponse {
  ok: boolean;
  data: iAdminTicketDetail;
}

/** Complainant shape for ticket detail UI (admin API + optional extended fields). */
export interface iTicketUser {
  id: string;
  name: string;
  phone?: string;
  email?: string | null;
  holdingNumber?: string | null;
  createdAt?: string;
}

/** Admin `GET /api/tickets/[ticketId]` complainant. */
export type iAdminTicketUser = iAdminTicketDetailUser;

export type iTicketImage = iAdminTicketDetailImage;

export type iTicketTimelineEntry = iAdminTicketDetailTimeline;

/** Normalized comment row for ticket detail UI. */
export interface iTicketComment {
  commentAt: string;
  commentBy: string;
  commentByAvatar?: string | null;
  comment?: string | null;
}

/** Assigned staff with contact fields (ticket detail panel). */
export interface iTicketAssignedStaff {
  id: string;
  name: string;
  email: string;
  phone: string;
  imgProfileUrl: string | null;
  staffPosition: { id: string; name: string };
  CurrentAddress: string | null;
}

/** Partial assignee when only list/summary staff data is available. */
export interface iAdminTicketAssignee {
  id: string;
  name: string;
  staffPosition?: { id: string; name: string };
}


/**
 * Staff home analytics data.
 */

export type StaffHomeAnalyticsComplaintTickets = {
  total: number;
  /** Tickets that are neither completed nor blocked (e.g. todo, in progress, reopened). */
  open: number;
  completed: number;
  blocked: number;
};

export type StaffHomeAnalyticsComplaintBreakdown = {
  id: string;
  title: string;
  open: number;
};

export type StaffHomeAnalyticsData = {
  complaintTickets: StaffHomeAnalyticsComplaintTickets;
  complaint: StaffHomeAnalyticsComplaintBreakdown[];
};

export type StaffTicketsListFilterParams = {
  query: string;
  selectedComplaintId: string | null;
  /** Empty = all statuses. */
  selectedStatuses: iTicketStatus[];
  month: string;
  year: string;
  selectedWards: number[];
  limit: number;
};

/** Assigned staff on a staff ticket list row. */
export type StaffTicketAssignedStaff = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string | null;
  imgProfileUrl: string | null;
  staffPosition: { id: string; name: string };
};

/** One ticket from `GET /staff/tickets`. */
export type StaffTicketListItem = {
  id: string;
  ticketTokenId: string;
  ward: number;
  status: iTicketStatus;
  title: string;
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
  complaint: { id: string; title: string };
  assignedStaff: StaffTicketAssignedStaff | null;
  images: { id: string; imageUrl: string; imageKey?: string; createdAt: string }[];
};

export type StaffTicketsPage = {
  items: StaffTicketListItem[];
  page: number;
  limit: number;
  hasMore: boolean;
  total: number;
};

export type StaffComplaintFilterOption = {
  id: string;
  label: string;
};

export type StaffTicketFiltersData = {
  complaints: StaffComplaintFilterOption[];
};

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

/** Full ticket from `GET /staff/tickets/:ticketId`. */
export type StaffTicketDetail = StaffTicketListItem & {
  timelines: StaffTicketTimelineEntry[];
  comments: StaffTicketComment[];
  user: StaffTicketDetailUser;
};

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
  status: "TODO" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED" | "REOPENED";
  title: string;
  description: string;
  ticketCategory: "COMPLIANT" | null;
  dueDateTime: string;
  locationAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  commentEnabled: boolean;
  rating: number | null;
  createdAt: string;
  updatedAt: string;
  complaint: { id: string; title: string };
  assignedStaff: UserTicketAssignedStaff | null;
  images: { id: string; imageUrl: string; imageKey?: string; createdAt: string }[];
};

/** One timeline row for a user ticket (API / DB shape, serialized dates). */
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
	authorType: "USER" | "STAFF" | "SYSTEM";
	authorUserId: string | null;
	authorStaffId: string | null;
	createdAt: string;
	authorUser: { id: string; name: string } | null;
	authorStaff: { id: string; name: string; imgProfileUrl: string | null } | null;
};

/** Citizen who filed the ticket (`GET .../:id` only). */
export type UserTicketDetailUser = {
	id: string;
	name: string;
	phone: string;
	email: string | null;
};

/** One page from `GET /user/tickets` (cursor pagination). */
export type UserTicketsPage = {
  items: TicketListItem[];
  nextCursor: string | null;
  hasMore: boolean;
};

/** Full ticket from `GET /api/v1/user/tickets/:ticketId` (and PATCH/PUT rating body). */
export type UserTicketDetail = StaffTicketListItem & {
	timelines: UserTicketTimelineEntry[];
	comments: UserTicketComment[];
	user: UserTicketDetailUser;
};