import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { isApiError } from '@/lib/api-client';
import { i18n } from '@/lib/i18n';

import { MOBILE_NUMBER_LENGTH } from '../constants';
import {
  parseSignupPhone,
  userSigninSchema,
  userSignupOtpSchema,
  type UserSigninFormValues,
} from '../schemas';
import type { UserAuthSession } from '../types/index';
import {
  useUserSigninOtpSendMutation,
  useUserSigninOtpVerifyMutation,
} from './use-user-auth-queries';

type Step = 'phone' | 'otp';

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

export interface UseUserSigninFormOptions {
  onSession?: (session: UserAuthSession) => void | Promise<void>;
  onSignedIn?: () => void;
}

export function useUserSigninForm({
  onSession,
  onSignedIn,
}: UseUserSigninFormOptions = {}) {
  const [step, setStep] = useState<Step>('phone');
  const [signinToken, setSigninToken] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const sendMutation = useUserSigninOtpSendMutation();
  const verifyMutation = useUserSigninOtpVerifyMutation();

  const phoneForm = useForm<UserSigninFormValues>({
    resolver: zodResolver(userSigninSchema),
    defaultValues: { phone: '' },
    mode: 'onSubmit',
  });

  const otpForm = useForm({
    resolver: zodResolver(userSignupOtpSchema),
    defaultValues: { otp: '' },
    mode: 'onSubmit',
  });

  const phone = phoneForm.watch('phone');
  const otp = otpForm.watch('otp');
  const phoneDisplay = useMemo(() => formatPhoneDisplay(phone), [phone]);

  const clearSendError = useCallback(() => {
    setSendError(null);
  }, []);

  const requestOtp = useCallback(
    async (values: UserSigninFormValues) => {
      setSendError(null);
      setSigninToken(null);
      try {
        const { signinToken: token } = await sendMutation.mutateAsync({
          phone: parseSignupPhone(values.phone),
        });
        setSigninToken(token);
        setStep('otp');
        otpForm.reset();
      } catch (error) {
        setSendError(apiErrorMessage(error, i18n.t('auth.couldNotSendOtp')));
      }
    },
    [otpForm, sendMutation],
  );

  const sendOtp = phoneForm.handleSubmit(requestOtp);
  const resendOtp = phoneForm.handleSubmit(requestOtp);

  const goBackToPhone = useCallback(() => {
    setStep('phone');
    setSigninToken(null);
    setSendError(null);
    otpForm.reset();
    sendMutation.reset();
    verifyMutation.reset();
  }, [otpForm, sendMutation, verifyMutation]);

  const verifyOtp = otpForm.handleSubmit(async ({ otp: otpValue }) => {
    setSendError(null);
    if (!signinToken) {
      otpForm.setError('otp', { message: i18n.t('auth.sessionExpiredOtp') });
      return;
    }

    try {
      const session = await verifyMutation.mutateAsync({
        signinToken,
        otp: otpValue,
      });
      await onSession?.(session);
      onSignedIn?.();
    } catch (error) {
      otpForm.setError('otp', {
        message: apiErrorMessage(error, i18n.t('auth.verificationFailed')),
      });
      otpForm.setValue('otp', '');
    }
  });

  const isSendingOtp = sendMutation.isPending;
  const isVerifyingOtp = verifyMutation.isPending;
  const isLoading = isSendingOtp || isVerifyingOtp;

  const stepsActions = useMemo(() => {
    if (step === 'phone') {
      return {
        title: i18n.t('auth.sendOtp'),
        loadingText: i18n.t('auth.sendingOtp'),
        onPress: sendOtp,
      };
    }
    return {
      title: i18n.t('auth.verifyOtp'),
      loadingText: i18n.t('auth.verifyingOtp'),
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
    phoneForm,
    otpForm,
    otp,
    phoneDisplay,
    goBackToPhone,
    resendOtp,
    stepsActions,
    maxPhoneLength: MOBILE_NUMBER_LENGTH,
  };
}

export type UseUserSigninFormResult = ReturnType<typeof useUserSigninForm>;
