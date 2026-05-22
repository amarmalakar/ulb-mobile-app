import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { isApiError } from '@/lib/api-client';
import { i18n } from '@/lib/i18n';

import { MOBILE_NUMBER_LENGTH } from '../constants';
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
      setSubmitError(apiErrorMessage(error, i18n.t('auth.signInFailed')));
    }
  });

  return {
    form,
    submitError,
    clearSubmitError,
    submit,
    isLoading: signinMutation.isPending,
    buttonTitle: i18n.t('auth.signIn'),
    buttonLoading: i18n.t('auth.signingIn'),
    maxPhoneLength: MOBILE_NUMBER_LENGTH,
  };
}

export type UseUserSigninFormResult = ReturnType<typeof useUserSigninForm>;
