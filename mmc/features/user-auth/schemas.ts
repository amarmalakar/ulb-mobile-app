import { z } from 'zod';

import { EMAIL_MAX_LENGTH, MOBILE_NUMBER_LENGTH, OTP_LENGTH } from './constants';
import { ERROR_MESSAGES } from './messages';

const phoneField = z
  .string()
  .length(MOBILE_NUMBER_LENGTH, ERROR_MESSAGES.mobileLength)
  .regex(/^[6-9]\d{9}$/, ERROR_MESSAGES.mobileLength);

const nameField = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(200, 'Name is too long');

const optionalEmailField = z
  .string()
  .max(EMAIL_MAX_LENGTH)
  .refine(
    (s) => s.trim().length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim()),
    ERROR_MESSAGES.invalidEmail,
  );

const optionalTextField = z.string().max(120);

function createWardField(maxWard?: number) {
  return z
    .string()
    .trim()
    .min(1, ERROR_MESSAGES.wardRequired)
    .regex(/^\d+$/, ERROR_MESSAGES.wardInvalid)
    .refine((s) => {
      const n = parseInt(s, 10);
      if (!Number.isInteger(n) || n < 1) return false;
      if (maxWard != null && n > maxWard) return false;
      return true;
    }, maxWard != null ? `Enter a ward number from 1 to ${maxWard}` : ERROR_MESSAGES.wardInvalid);
}

export function createUserSignupDetailsSchema(maxWard?: number) {
  const wardField = createWardField(maxWard);

  return z
    .object({
      phone: z.string(),
      name: z.string(),
      email: z.string(),
      holdingNumber: z.string(),
      wardNumber: z.string(),
    })
    .superRefine((data, ctx) => {
      const phoneResult = phoneField.safeParse(data.phone);
      if (!phoneResult.success) {
        for (const issue of phoneResult.error.issues) {
          ctx.addIssue({ ...issue, path: ['phone'] });
        }
      }

      const nameResult = nameField.safeParse(data.name);
      if (!nameResult.success) {
        for (const issue of nameResult.error.issues) {
          ctx.addIssue({ ...issue, path: ['name'] });
        }
      }

      const emailResult = optionalEmailField.safeParse(data.email);
      if (!emailResult.success) {
        for (const issue of emailResult.error.issues) {
          ctx.addIssue({ ...issue, path: ['email'] });
        }
      }

      const holdingResult = optionalTextField.safeParse(data.holdingNumber);
      if (!holdingResult.success) {
        for (const issue of holdingResult.error.issues) {
          ctx.addIssue({ ...issue, path: ['holdingNumber'] });
        }
      }

      const wardResult = wardField.safeParse(data.wardNumber);
      if (!wardResult.success) {
        for (const issue of wardResult.error.issues) {
          ctx.addIssue({ ...issue, path: ['wardNumber'] });
        }
      }
    });
}

export const userSignupDetailsSchema = createUserSignupDetailsSchema();

export const userSignupOtpSchema = z.object({
  otp: z
    .string()
    .length(OTP_LENGTH, ERROR_MESSAGES.otpLength)
    .regex(/^\d+$/, ERROR_MESSAGES.otpLength),
});

export const userSigninSchema = z.object({
  phone: phoneField,
});

export type UserSignupDetailsFormValues = z.infer<typeof userSignupDetailsSchema>;
export type UserSignupOtpFormValues = z.infer<typeof userSignupOtpSchema>;
export type UserSigninFormValues = z.infer<typeof userSigninSchema>;

/** Parsed phone for API (digits only). */
export function parseSignupPhone(phone: string): string {
  return phone.replace(/\D/g, '').slice(0, MOBILE_NUMBER_LENGTH);
}

/** Ward number for API (digits only, validated by schema before call). */
export function parseWardNumber(ward: string): number {
  return parseInt(ward.replace(/\D/g, ''), 10);
}

export function trimOptionalField(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
