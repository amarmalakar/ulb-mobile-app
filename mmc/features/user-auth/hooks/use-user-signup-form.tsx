import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAppInitContext } from '@/components/provider/app-init-provider';
import { isApiError } from '@/lib/api-client';

import { MOBILE_NUMBER_LENGTH } from '../constants';
import { USER_AUTH_MESSAGES } from '../messages';
import {
  createUserSignupDetailsSchema,
  parseSignupPhone,
  parseWardNumber,
  trimOptionalField,
  userSignupOtpSchema,
  type UserSignupDetailsFormValues,
} from '../schemas';
import type { UserAuthSession } from '../types/index';
import {
  useUserSignupOtpSendMutation,
  useUserSignupOtpVerifyMutation,
} from './use-user-auth-queries';

type Step = 'details' | 'otp';

function apiErrorMessage(error: unknown, fallback: string): string {
  if (isApiError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === MOBILE_NUMBER_LENGTH) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return digits;
}

export interface UseUserSignupFormOptions {
  onSession?: (session: UserAuthSession) => void | Promise<void>;
  onVerified?: () => void;
}

export function useUserSignupForm({
  onSession,
  onVerified,
}: UseUserSignupFormOptions = {}) {
  const [step, setStep] = useState<Step>('details');
  const [signupToken, setSignupToken] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const sendMutation = useUserSignupOtpSendMutation();
  const verifyMutation = useUserSignupOtpVerifyMutation();
  const { ulb } = useAppInitContext();

  const maxWard =
    ulb?.totalWards != null && ulb.totalWards > 0 ? ulb.totalWards : undefined;
  const detailsSchema = useMemo(
    () => createUserSignupDetailsSchema(maxWard),
    [maxWard],
  );

  const detailsForm = useForm<UserSignupDetailsFormValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      phone: '',
      name: '',
      email: '',
      holdingNumber: '',
      wardNumber: '',
    },
    mode: 'onSubmit',
  });

  const otpForm = useForm({
    resolver: zodResolver(userSignupOtpSchema),
    defaultValues: { otp: '' },
    mode: 'onSubmit',
  });

  const phone = detailsForm.watch('phone');
  const phoneDisplay = useMemo(() => formatPhoneDisplay(phone), [phone]);

  const clearSendError = useCallback(() => {
    setSendError(null);
  }, []);

  const requestOtp = useCallback(
    async (values: UserSignupDetailsFormValues) => {
      setSendError(null);
      setSignupToken(null);
      try {
        const { signupToken: token } = await sendMutation.mutateAsync({
          phone: parseSignupPhone(values.phone),
        });
        setSignupToken(token);
        setStep('otp');
        otpForm.reset();
      } catch (error) {
        setSendError(apiErrorMessage(error, 'Could not send OTP'));
      }
    },
    [otpForm, sendMutation],
  );

  const sendOtp = detailsForm.handleSubmit(requestOtp);
  const resendOtp = detailsForm.handleSubmit(requestOtp);

  const goBackToDetails = useCallback(() => {
    setStep('details');
    setSignupToken(null);
    setSendError(null);
    otpForm.reset();
    sendMutation.reset();
    verifyMutation.reset();
  }, [otpForm, sendMutation, verifyMutation]);

  const verifyOtp = otpForm.handleSubmit(async ({ otp }) => {
    setSendError(null);
    if (!signupToken) {
      otpForm.setError('otp', { message: 'Session expired. Go back and request a new code.' });
      return;
    }

    const values = detailsForm.getValues();
    const email = trimOptionalField(values.email);
    const holdingNumber = trimOptionalField(values.holdingNumber);
    const wardNumber = parseWardNumber(values.wardNumber);

    try {
      const session = await verifyMutation.mutateAsync({
        signupToken,
        otp,
        name: values.name.trim(),
        wardNumber,
        ...(email ? { email } : {}),
        ...(holdingNumber ? { holdingNumber } : {}),
      });
      await onSession?.(session);
      onVerified?.();
    } catch (error) {
      otpForm.setError('otp', {
        message: apiErrorMessage(error, 'Verification failed'),
      });
      otpForm.setValue('otp', '');
    }
  });

  const isSendingOtp = sendMutation.isPending;
  const isVerifyingOtp = verifyMutation.isPending;
  const isLoading = isSendingOtp || isVerifyingOtp;

  const stepsActions = useMemo(() => {
    if (step === 'details') {
      return {
        title: USER_AUTH_MESSAGES.sendVerificationCode,
        loadingText: USER_AUTH_MESSAGES.sendingOtp,
        onPress: sendOtp,
      };
    }
    return {
      title: USER_AUTH_MESSAGES.verifyAndContinue,
      loadingText: USER_AUTH_MESSAGES.verifying,
      onPress: verifyOtp,
    };
  }, [step, sendOtp, verifyOtp]);

  return {
    step,
    isLoading,
    isVerifyingOtp,
    isResending: isSendingOtp && step === 'otp',
    sendError,
    clearSendError,
    detailsForm,
    otpForm,
    phoneDisplay,
    maxWard,
    goBackToDetails,
    resendOtp,
    stepsActions,
  };
}

export type UseUserSignupFormResult = ReturnType<typeof useUserSignupForm>;
