import { MOBILE_NUMBER_LENGTH, OTP_LENGTH } from './constants';

export const ERROR_MESSAGES = {
  mobileLength: `Mobile number must be ${MOBILE_NUMBER_LENGTH} digits`,
  invalidEmail: 'Enter a valid email address',
  otpLength: `Enter the ${OTP_LENGTH}-digit code`,
  invalidOtp: 'Invalid OTP. Please try again.',
} as const;

export const HELPER_MESSAGES = {
  mobile: "We'll text you a code to verify it's you.",
  email: "We'll email you a code to verify it's you.",
  otp: (length: number) => `Enter the ${length}-digit code we just sent.`,
  resendPrompt: "Didn't get the code?",
} as const;

export const ACTION_LABELS = {
  sendOtp: 'Send OTP',
  sendingOtp: 'Sending OTP...',
  verifyOtp: 'Verify OTP',
  verifyingOtp: 'Verifying OTP...',
  resendOtp: 'Resend OTP',
  changeMobile: 'Change number',
  changeEmail: 'Change email',
} as const;
