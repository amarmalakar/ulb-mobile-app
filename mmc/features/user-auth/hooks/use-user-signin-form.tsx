import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { isApiError } from '@/lib/api-client';

import { MOBILE_NUMBER_LENGTH } from '../constants';
import { USER_AUTH_MESSAGES } from '../messages';
import { parseSignupPhone, userSigninSchema, type UserSigninFormValues } from '../schemas';
import type { UserAuthSession } from '../types/index';
import { useUserSigninMutation } from './use-user-auth-queries';

function apiErrorMessage(error: unknown, fallback: string): string {
  if (isApiError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

export interface UseUserSigninFormOptions {
  onSession?: (session: UserAuthSession) => void | Promise<void>;
  onSignedIn?: () => void;
}

export function useUserSigninForm({
  onSession,
  onSignedIn,
}: UseUserSigninFormOptions = {}) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const signinMutation = useUserSigninMutation();

  const form = useForm<UserSigninFormValues>({
    resolver: zodResolver(userSigninSchema),
    defaultValues: { phone: '' },
    mode: 'onSubmit',
  });

  const clearSubmitError = useCallback(() => {
    setSubmitError(null);
  }, []);

  const submit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      const session = await signinMutation.mutateAsync({
        phone: parseSignupPhone(values.phone),
      });
      await onSession?.(session);
      onSignedIn?.();
    } catch (error) {
      setSubmitError(apiErrorMessage(error, 'Sign in failed'));
    }
  });

  return {
    form,
    submitError,
    clearSubmitError,
    submit,
    isLoading: signinMutation.isPending,
    buttonTitle: USER_AUTH_MESSAGES.signIn,
    buttonLoading: USER_AUTH_MESSAGES.signingIn,
    maxPhoneLength: MOBILE_NUMBER_LENGTH,
  };
}

export type UseUserSigninFormResult = ReturnType<typeof useUserSigninForm>;
