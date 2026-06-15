export enum TicketCategory {
  SERVICE = 'SERVICE',
}

export type iTicketStatus =
  | 'TODO'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'BLOCKED'
  | 'REOPENED';

export type UserTicketAssignedStaff = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string | null;
  imgProfileUrl: string | null;
  staffPosition: { id: string; name: string };
};

export type LocalizedTitle = Record<string, string>;

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
