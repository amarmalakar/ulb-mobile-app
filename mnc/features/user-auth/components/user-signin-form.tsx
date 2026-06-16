import { useCallback } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { KeyboardFormScroll } from '@/components/common/keyboard-form-scroll';
import { useRouter } from 'expo-router';

import { Button } from '@/components/ui/button';
import { Typography } from '@/components/common/typography';
import { MOBILE_NUMBER_LENGTH, OTP_LENGTH } from '../constants';
import {
  useUserSigninForm,
  type UseUserSigninFormOptions,
} from '../hooks/use-user-signin-form';
import { UserMobileInput } from './user-mobile-input';
import { UserOtpInput } from './user-otp-input';

export function UserSigninForm({
  onSession,
  onSignedIn,
}: UseUserSigninFormOptions = {}) {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    step,
    isLoading,
    isVerifyingOtp,
    isResending,
    sendError,
    clearSendError,
    phoneForm,
    otpForm,
    otp,
    phoneDisplay,
    goBackToPhone,
    resendOtp,
    stepsActions,
    maxPhoneLength,
  } = useUserSigninForm({ onSession, onSignedIn });

  const onPressSignUp = useCallback(() => {
    router.push('/user-auth/user-signup-screen');
  }, [router]);

  return (
    <KeyboardFormScroll scrollViewProps={{ contentContainerClassName: 'flex-grow' }}>
      <View className="mt-12 gap-4">
        {step === 'phone' ? (
          <Controller
            control={phoneForm.control}
            name="phone"
            render={({ field, fieldState }) => (
              <UserMobileInput
                value={field.value}
                onChangeText={(text) => {
                  field.onChange(text.replace(/\D/g, '').slice(0, maxPhoneLength));
                  clearSendError();
                }}
                maxLength={maxPhoneLength}
                error={fieldState.error?.message}
                disabled={isLoading}
              />
            )}
          />
        ) : (
          <UserOtpInput
            value={otp ?? ''}
            onChangeText={(text) => {
              otpForm.setValue('otp', text, { shouldDirty: true });
              clearSendError();
            }}
            error={otpForm.formState.errors.otp?.message}
            cellCount={OTP_LENGTH}
            phoneDisplay={phoneDisplay}
            onChangePhone={goBackToPhone}
            disabled={isVerifyingOtp || isResending}
            onResend={resendOtp}
          />
        )}

        {sendError ? (
          <Typography variant="body2" color="destructive" className="px-1">
            {sendError}
          </Typography>
        ) : null}
      </View>

      <Button
        disabled={isLoading}
        className="mt-auto h-14 rounded-lg bg-primary"
        onPress={stepsActions.onPress}
      >
        <Typography variant="h5" weight="bold" className="text-white">
          {isLoading ? stepsActions.loadingText : stepsActions.title}
        </Typography>
      </Button>

      {step === 'phone' ? (
        <View className="mt-4 flex-row flex-wrap items-center justify-center gap-1">
          <Typography variant="h6" color="muted">
            {t('auth.newHere')}
          </Typography>
          <Pressable onPress={onPressSignUp} disabled={isLoading} hitSlop={8}>
            <Typography variant="h6" color="primary">
              {t('auth.createAccount')}
            </Typography>
          </Pressable>
        </View>
      ) : null}
    </KeyboardFormScroll>
  );
}
