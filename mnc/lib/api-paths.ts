/** Mobile API paths (relative to `/mobile/v1` base URL). */
export const API_PATHS = {
  user: {
    signupOtpSend: '/auth/user/signup/otp/send',
    signupOtpVerify: '/auth/user/signup/otp/verify',
    signin: '/auth/user/signin',
    sessionRefresh: '/auth/user/session/refresh',
    logout: '/auth/user/logout',
    mpinStatus: '/auth/user/mpin/status',
    mpinSet: '/auth/user/mpin/set',
    mpinVerify: '/auth/user/mpin/verify',
    mpinResetOtpSend: '/auth/user/mpin/reset/otp/send',
    mpinResetConfirm: '/auth/user/mpin/reset/confirm',
    info: '/user/info',
  },
  staff: {
    login: '/auth/staff/login',
    verify: '/auth/staff/verify',
    mpinStatus: '/auth/staff/mpin/status',
    mpinSet: '/auth/staff/mpin/set',
    mpinVerify: '/auth/staff/mpin/verify',
    mpinResetRequest: '/auth/staff/mpin/reset/request',
    mpinResetConfirm: '/auth/staff/mpin/reset/confirm',
    info: '/staff/info',
  },
  common: {
    feedbackAndSuggestion: '/common/feedback-and-suggestion',
  },
} as const;
