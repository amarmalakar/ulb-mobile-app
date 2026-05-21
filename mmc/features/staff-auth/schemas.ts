import { z } from "zod";
import { EMAIL_MAX_LENGTH, MOBILE_NUMBER_LENGTH, OTP_LENGTH } from "./constants";
import { ERROR_MESSAGES } from "./messages";

const mobileNumberField = z
  .string()
  .length(MOBILE_NUMBER_LENGTH, ERROR_MESSAGES.mobileLength)
  .regex(/^\d+$/, ERROR_MESSAGES.mobileLength);

const emailField = z
  .string()
  .min(1, ERROR_MESSAGES.invalidEmail)
  .max(EMAIL_MAX_LENGTH, ERROR_MESSAGES.invalidEmail)
  .email(ERROR_MESSAGES.invalidEmail);

export const staffContactSchema = z
  .object({
    method: z.enum(["phone", "email"]),
    mobileNumber: z.string(),
    email: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.method === "phone") {
      const result = mobileNumberField.safeParse(data.mobileNumber);
      if (!result.success) {
        for (const issue of result.error.issues) {
          ctx.addIssue({ ...issue, path: ["mobileNumber"] });
        }
      }
      return;
    }

    const result = emailField.safeParse(data.email);
    if (!result.success) {
      for (const issue of result.error.issues) {
        ctx.addIssue({ ...issue, path: ["email"] });
      }
    }
  });

export const staffOtpSchema = z.object({
  otp: z
    .string()
    .length(OTP_LENGTH, ERROR_MESSAGES.otpLength)
    .regex(/^\d+$/, ERROR_MESSAGES.otpLength),
});

export type StaffContactFormValues = z.infer<typeof staffContactSchema>;
export type StaffOtpFormValues = z.infer<typeof staffOtpSchema>;
