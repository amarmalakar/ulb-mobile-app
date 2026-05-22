import { z } from "zod";
import { EMAIL_MAX_LENGTH, MOBILE_NUMBER_LENGTH, OTP_LENGTH } from "./constants";
import { i18n } from "@/lib/i18n";

const mobileNumberField = z
  .string()
  .length(MOBILE_NUMBER_LENGTH, i18n.t("auth.mobileLength"))
  .regex(/^\d+$/, i18n.t("auth.mobileLength"));

const emailField = z
  .string()
  .min(1, i18n.t("auth.invalidEmail"))
  .max(EMAIL_MAX_LENGTH, i18n.t("auth.invalidEmail"))
  .email(i18n.t("auth.invalidEmail"));

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
    .length(OTP_LENGTH, i18n.t("auth.otpLength"))
    .regex(/^\d+$/, i18n.t("auth.otpLength")),
});

export type StaffContactFormValues = z.infer<typeof staffContactSchema>;
export type StaffOtpFormValues = z.infer<typeof staffOtpSchema>;
