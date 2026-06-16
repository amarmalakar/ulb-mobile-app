import { MOBILE_NUMBER_LENGTH, OTP_LENGTH } from './constants';

export const ERROR_MESSAGES = {
  mobileLength: `Mobile number must be ${MOBILE_NUMBER_LENGTH} digits`,
  invalidEmail: 'Enter a valid email address',
  wardRequired: 'Ward number is required',
  wardInvalid: 'Enter a valid ward number',
  otpLength: `Enter the ${OTP_LENGTH}-digit code`,
  invalidOtp: 'Invalid OTP. Please try again.',
} as const;

export const USER_AUTH_MESSAGES = {
  sendOtp: 'Send OTP',
  sendVerificationCode: 'Send verification code',
  sendingOtp: 'Sending…',
  verifyAndContinue: 'Verify & continue',
  verifying: 'Verifying…',
  signIn: 'Continue',
  signingIn: 'Signing in…',
  invalidPhone: 'Enter a valid 10-digit mobile number',
  mobileHint: "We'll text you a verification code.",
  otpHint: 'Enter the code sent to your phone via SMS.',
  changeMobile: 'Change number',
  resendOtp: 'Resend OTP',
} as const;
