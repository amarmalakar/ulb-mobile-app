import { MOBILE_NUMBER_LENGTH } from "./constants";
import { OTP_LENGTH } from "./constants";

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

export const USER_MPIN_MESSAGES = {
	continue: "Continue",
	saving: "Saving…",
	verifying: "Verifying…",
	sendingReset: "Sending…",
	refetchStatus: "Try again",
	locked: "Too many incorrect attempts. Try again later.",
	titleCreate: "Create your MPIN",
	helperCreate: "Use a 4-digit number you will remember.",
	titleEnter: "Enter your MPIN",
	helperEnter: "Enter the same MPIN you created earlier.",
	titleReset: "Reset MPIN",
	helperReset: "Enter the SMS code we sent you, then choose a new MPIN.",
	confirmLabel: "Confirm MPIN",
	resetMpin: "Forgot MPIN?",
	back: "Cancel reset",
} as const;
