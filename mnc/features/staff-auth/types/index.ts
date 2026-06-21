export type StaffLoginRequest = {
  emailOrPhone: string;
};

export type StaffLoginChannel = 'email' | 'mobile';

export type StaffLoginMutationData = {
  channel: StaffLoginChannel;
  loginToken: string;
};

export type StaffVerifyRequest = {
  loginToken: string;
  otp: string;
};

export type StaffJwtClaimsPublic = {
  id: string;
  ulbId: string;
  name: string;
  email: string;
  phoneNumber: string;
  positionId: string;
  departmentId: string | null;
  wards: number[];
  imgProfileUrl: string | null;
  address: string | null;
  isActive: boolean;
};

export type StaffAuthSession = {
  refreshToken?: string;
  accessToken: string;
  staff: StaffJwtClaimsPublic;
};

export type StaffSessionRefreshRequest = {
  refreshToken: string;
};

export type StaffSessionRefreshData = {
  accessToken: string;
};

export type StaffLogoutRequest = {
  refreshToken: string;
};

export type StaffInfoZone = {
  id: string;
  name: string;
  wards: number[];
};

export type StaffInfoReportTo = {
  id: string;
  name: string;
};

export type StaffAccess = 'COMPLAINTS' | 'DOCUMENTS' | 'BOOKINGS';

export type StaffType =
  | 'PUBLIC_REPRESENTATIVE'
  | 'MUNICIPAL_STAFF'
  | 'TECHNICAL_STAFF';

export type StaffInfo = {
  id: string;
  ulbId: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string | null;
  imgProfileUrl: string | null;
  isActive: boolean;
  departmentId: string | null;
  positionId: string;
  positionName: string;
  type: StaffType;
  reportTo: StaffInfoReportTo | null;
  zone: StaffInfoZone[];
  /** Wards assigned directly on the staff profile (excludes zone expansion). */
  selectedWards: number[];
  /** All wards the staff may access (selected wards ∪ zone wards). */
  wards: number[];
  ulbTotalWards?: number;
  ulbTotalZones?: number;
  access: StaffAccess[];
  createdAt: string;
  updatedAt: string;
};
