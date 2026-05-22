import { z } from 'zod';

import { EMAIL_MAX_LENGTH, MOBILE_NUMBER_LENGTH, OTP_LENGTH } from './constants';
import { i18n } from '@/lib/i18n';

const phoneField = z
  .string()
  .length(MOBILE_NUMBER_LENGTH, i18n.t('auth.mobileLength'))
  .regex(/^[6-9]\d{9}$/, i18n.t('auth.mobileLength'));

const nameField = z
  .string()
  .trim()
  .min(1, i18n.t('auth.nameRequired'))
  .max(200, i18n.t('auth.nameTooLong'));

const optionalEmailField = z
  .string()
  .max(EMAIL_MAX_LENGTH)
  .refine(
    (s) => s.trim().length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim()),
    i18n.t('auth.invalidEmail'),
  );

const optionalTextField = z.string().max(120);

function createWardField(maxWard?: number) {
  return z
    .string()
    .trim()
    .min(1, i18n.t('auth.wardRequired'))
    .regex(/^\d+$/, i18n.t('auth.wardInvalid'))
    .refine((s) => {
      const n = parseInt(s, 10);
      if (!Number.isInteger(n) || n < 1) return false;
      if (maxWard != null && n > maxWard) return false;
      return true;
    }, maxWard != null ? i18n.t('auth.wardHelperRange', { max: maxWard }) : i18n.t('auth.wardInvalid'));
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
    .length(OTP_LENGTH, i18n.t('auth.otpLength'))
    .regex(/^\d+$/, i18n.t('auth.otpLength')),
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
