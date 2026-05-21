import { MOBILE_NUMBER_LENGTH, MPIN_LENGTH, OTP_LENGTH } from "./constants";

export const ERROR_MESSAGES = {
  mobileLength: `Mobile number must be ${MOBILE_NUMBER_LENGTH} digits`,
  invalidEmail: "Enter a valid email address",
  otpLength: `Enter the ${OTP_LENGTH}-digit code`,
  invalidOtp: "Invalid OTP. Please try again.",
} as const;

export const HELPER_MESSAGES = {
  mobile:
    "We'll verify your registered mobile with the fixed sign-in code 000000.",
  email: "We'll email you a code to verify it's you.",
  otp: (length: number) => `Enter the ${length}-digit code we just sent.`,
  resendPrompt: "Didn't get the code?",
} as const;

export const ACTION_LABELS = {
  sendOtp: "Send OTP",
  sendingOtp: "Sending OTP...",
  verifyOtp: "Verify OTP",
  verifyingOtp: "Verifying OTP...",
  resendOtp: "Resend OTP",
  changeMobile: "Change number",
  changeEmail: "Change email",
} as const;

export const MPIN_MESSAGES = {
  titleCreate: "Create your MPIN",
  titleEnter: "Enter your MPIN",
  titleReset: "Reset your MPIN",
  locked: "MPIN is locked after too many attempts. Try again later.",
  helperCreate: `Use ${MPIN_LENGTH} digits you will remember.`,
  helperEnter: `Enter your ${MPIN_LENGTH}-digit MPIN to continue.`,
  helperReset: `Enter the ${OTP_LENGTH}-digit code from your email, then your new ${MPIN_LENGTH}-digit MPIN twice.`,
  confirmLabel: "Confirm MPIN",
  resetMpin: "Reset MPIN",
  sendingReset: "Sending code...",
  continue: "Continue",
  saving: "Saving...",
  verifying: "Verifying...",
  back: "Back",
  mpinMismatch: "MPIN entries do not match.",
  mpinLength: `Enter all ${MPIN_LENGTH} digits.`,
  otpLength: `Enter all ${OTP_LENGTH} digits.`,
  refetchStatus: "Try again",
} as const;
