/** One catalog row from `GET /user/complaints`. */
export type UserComplaintCatalogItem = {
  id: string;
  ulbId: string;
  title: string;
  description: string;
  imageUrl: string | null;
  isActive: boolean;
  subComplaints: unknown;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserComplaintTicketRequest = {
  complaintId: string;
  ticketCategory: "COMPLIANT";
  wardNumber: number;
  title: string;
  description: string;
  locationAddress?: string;
  latitude?: number;
  longitude?: number;
  /** R2 object keys from `POST /api/v1/user/media/upload`. */
  imageKeys?: string[];
};

export type CreateUserComplaintTicketResult = {
  id: string;
  ticketTokenId: string;
  status: string;
  ward: number;
  title: string;
  assignedStaffId: string | null;
  createdAt: string;
  assignedStaffName: string;
};