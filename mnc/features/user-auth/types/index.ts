export type UserPublic = {
  id: string;
  ulbId: string;
  phone: string;
  name: string;
  email: string | null;
  holdingNumber: string | null;
  wardNumber: number | null;
  hasMpin: boolean;
};

export type UserAuthSession = {
  refreshToken: string;
  accessToken: string;
  user: UserPublic;
};

export type UserSignupOtpSendRequest = {
  phone: string;
};

export type UserSignupOtpSendData = {
  signupToken: string;
};

export type UserSignupOtpVerifyRequest = {
  signupToken: string;
  otp: string;
  name: string;
  wardNumber: number;
  email?: string;
  holdingNumber?: string;
};

export type UserSigninRequest = {
  phone: string;
};

export type UserSessionRefreshRequest = {
  refreshToken: string;
};

export type UserSessionRefreshData = {
  accessToken: string;
};

export type UserLogoutRequest = {
  refreshToken: string;
};

export type UserMpinStatusData = {
  mpinSet: boolean;
  locked: boolean;
  lockedUntil: string | null;
};

export type UserMpinSetVariables = {
  accessToken: string;
  mpin: string;
  confirmMpin: string;
};

export type UserMpinSetData = {
  ok: true;
  accessToken?: string;
};

export type UserMpinVerifyVariables = {
  mpin: string;
  refreshToken: string;
  accessToken?: string;
};

export type UserMpinVerifyData = {
  accessToken: string;
  refreshToken?: string;
};

export type UserMpinResetOtpSendData = {
  resetToken: string;
};

export type UserMpinResetConfirmVariables = {
  resetToken: string;
  otp: string;
  mpin: string;
  confirmMpin: string;
};

export type UserMpinResetConfirmData = {
  ok: true;
};

export type UserInfo = {
  id: string;
  ulbId: string;
  name: string;
  email: string | null;
  phone: string;
  holdingNumber: string | null;
  wardNumber: number | null;
  hasMpin: boolean;
  createdAt: string;
  updatedAt: string;
};
