import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { isApiError } from "@/lib/api-client";
import {
  useStaffLoginMutation,
  useStaffVerifyMutation,
} from "./use-staff-auth-queries";
import { ACTION_LABELS } from "../messages";
import {
  staffContactSchema,
  staffOtpSchema,
  type StaffContactFormValues,
  type StaffOtpFormValues,
} from "../schemas";
import type { Contact, ContactMethod } from "../types";
import type { StaffAuthSession } from "../types/index";

type Step = "contact" | "otp";

function emailOrPhoneFromContact(values: StaffContactFormValues): string {
  return values.method === "phone" ? values.mobileNumber : values.email;
}

function apiErrorMessage(error: unknown, fallback: string): string {
  if (isApiError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

export type UseStaffLoginFormOptions = {
  onVerified?: (session: StaffAuthSession) => void | Promise<void>;
};

export function useStaffLoginForm({ onVerified }: UseStaffLoginFormOptions = {}) {
  const [step, setStep] = useState<Step>("contact");
  const [loginToken, setLoginToken] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const loginMutation = useStaffLoginMutation();
  const verifyMutation = useStaffVerifyMutation();

  const contactForm = useForm<StaffContactFormValues>({
    resolver: zodResolver(staffContactSchema),
    defaultValues: {
      method: "email",
      mobileNumber: "",
      email: "",
    },
    mode: "onSubmit",
  });

  const otpForm = useForm<StaffOtpFormValues>({
    resolver: zodResolver(staffOtpSchema),
    defaultValues: { otp: "" },
    mode: "onSubmit",
  });

  const { method, mobileNumber, email } = contactForm.watch();

  const isSendingOtp = loginMutation.isPending;
  const isVerifyingOtp = verifyMutation.isPending;
  const isLoading = isSendingOtp || isVerifyingOtp;

  const clearSendError = useCallback(() => {
    setSendError(null);
  }, []);

  const switchMethod = useCallback(
    (next: ContactMethod) => {
      contactForm.setValue("method", next);
      contactForm.clearErrors(next === "phone" ? "email" : "mobileNumber");
      clearSendError();
    },
    [clearSendError, contactForm],
  );

  const goBackToContact = useCallback(() => {
    setStep("contact");
    setLoginToken(null);
    setSendError(null);
    otpForm.reset();
    loginMutation.reset();
    verifyMutation.reset();
  }, [loginMutation, otpForm, verifyMutation]);

  const activeContact: Contact | null = useMemo(() => {
    if (step !== "otp") {
      return null;
    }

    return method === "phone"
      ? { kind: "phone", value: mobileNumber }
      : { kind: "email", value: email };
  }, [step, method, mobileNumber, email]);

  const requestOtp = useCallback(
    async (values: StaffContactFormValues) => {
      setSendError(null);
      setLoginToken(null);
      try {
        const data = await loginMutation.mutateAsync({
          emailOrPhone: emailOrPhoneFromContact(values),
        });
        setLoginToken(data.loginToken);
        setStep("otp");
        otpForm.reset();
      } catch (error) {
        setSendError(apiErrorMessage(error, "Failed to send OTP. Try again."));
      }
    },
    [loginMutation, otpForm],
  );

  const sendOtp = contactForm.handleSubmit(requestOtp);

  const resendOtp = contactForm.handleSubmit(requestOtp);

  const verifyOtp = otpForm.handleSubmit(async ({ otp }) => {
    setSendError(null);
    if (!loginToken) {
      setSendError("Session expired. Go back and try again.");
      return;
    }
    try {
      const session = await verifyMutation.mutateAsync({ loginToken, otp });
      await onVerified?.(session);
    } catch (error) {
      setSendError(apiErrorMessage(error, "Failed to verify OTP. Try again."));
      otpForm.setValue("otp", "");
    }
  });

  const stepsActions = useMemo(() => {
    if (step === "contact") {
      return {
        title: ACTION_LABELS.sendOtp,
        loadingText: ACTION_LABELS.sendingOtp,
        onPress: sendOtp,
      };
    }

    return {
      title: ACTION_LABELS.verifyOtp,
      loadingText: ACTION_LABELS.verifyingOtp,
      onPress: verifyOtp,
    };
  }, [step, sendOtp, verifyOtp]);

  return {
    step,
    isLoading,
    isVerifyingOtp,
    isResending: loginMutation.isPending && step === "otp",
    sendError,
    clearSendError,
    contactForm,
    otpForm,
    switchMethod,
    activeContact,
    goBackToContact,
    resendOtp,
    stepsActions,
  };
}
