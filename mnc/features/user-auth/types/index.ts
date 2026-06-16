export type UserPublic = {
  id: string;
  ulbId: string;
  phone: string;
  name: string;
  email: string | null;
  holdingNumber: string | null;
  wardNumber: number | null;
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

export type UserSigninOtpSendRequest = {
  phone: string;
};

export type UserSigninOtpSendData = {
  signinToken: string;
};

export type UserSigninOtpVerifyRequest = {
  signinToken: string;
  otp: string;
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

export type UserInfo = {
  id: string;
  ulbId: string;
  name: string;
  email: string | null;
  phone: string;
  holdingNumber: string | null;
  wardNumber: number | null;
  createdAt: string;
  updatedAt: string;
};
