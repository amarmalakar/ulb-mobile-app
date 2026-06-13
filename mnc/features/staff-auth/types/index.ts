export type StaffLoginRequest = {
  emailOrPhone: string;
};

export type StaffLoginChannel = "email" | "mobile";

export type StaffLoginMutationData = {
  channel: StaffLoginChannel;
  loginToken: string;
};

type StaffLoginApiResponse = {
  ok: boolean;
  data?: StaffLoginMutationData;
  message?: string;
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
  accessToken: string;
  staff: StaffJwtClaimsPublic;
};

type StaffVerifyApiResponse = {
  ok: boolean;
  data?: StaffAuthSession;
  message?: string;
};

// --- MPIN (`Authorization: Bearer` required; pass `accessToken` from staff verify) ---

export type StaffMpinStatusData = {
  mpinSet: boolean;
  locked: boolean;
  lockedUntil: string | null;
};

type StaffMpinStatusApiResponse = {
  ok: boolean;
  data?: StaffMpinStatusData;
  message?: string;
};

export type StaffMpinOkData = {
  ok: true;
};

type StaffMpinSimpleApiResponse = {
  ok: boolean;
  data?: StaffMpinOkData;
  message?: string;
};

export type StaffMpinResetRequestData = {
  resetToken: string;
};

type StaffMpinResetRequestApiResponse = {
  ok: boolean;
  data?: StaffMpinResetRequestData;
  message?: string;
};

export type StaffMpinVerifyData = {
  ok: true;
  verified: true;
};

type StaffMpinVerifyApiResponse = {
  ok: boolean;
  data?: StaffMpinVerifyData;
  message?: string;
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
  reportTo: StaffInfoReportTo | null;
  zone: StaffInfoZone[];
  wards: number[];
  access: StaffAccess[];
  createdAt: string;
  updatedAt: string;
};

type StaffInfoApiResponse = {
  ok: boolean;
  data?: StaffInfo;
  message?: string;
};