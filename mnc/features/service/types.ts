export type LocalizedTitle = {
  en: string;
  hi: string;
};

export type UserServiceSubService = {
  id: string;
  serviceId: string;
  title: LocalizedTitle;
  active: boolean;
  sortOrder: number;
};

export type UserService = {
  id: string;
  ulbId: string;
  title: LocalizedTitle;
  icon: string | null;
  /** R2 object key when `icon` is a ServiceIcon id. */
  iconPathname: string | null;
  color: string | null;
  active: boolean;
  sortOrder: number;
  subServices: UserServiceSubService[];
  createdAt: string;
  updatedAt: string;
};

export type CreateUserServiceTicketRequest = {
  serviceId: string;
  subServiceId: string;
  ticketCategory: "SERVICE";
  wardNumber: number;
  phoneNumber: string;
  description: string;
  locationAddress?: string;
  latitude?: number;
  longitude?: number;
  /** R2 object keys from `POST /user/media/upload`. */
  imageKeys?: string[];
};

export type CreateUserServiceTicketResult = {
  id: string;
  ticketTokenId: string;
  status: string;
  ward: number;
  assignedStaffId: string | null;
  createdAt: string;
  assignedStaffName: string;
};
