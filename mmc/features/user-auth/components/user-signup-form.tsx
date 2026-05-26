import { useCallback } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { MOBILE_NUMBER_LENGTH, OTP_LENGTH } from '../constants';
import {
  useUserSignupForm,
  type UseUserSignupFormOptions,
} from '../hooks/use-user-signup-form';
import { UserEmailInput } from './user-email-input';
import { UserMobileInput } from './user-mobile-input';
import { UserOtpInput } from './user-otp-input';
import { UserTextInput } from './user-text-input';
import { UserWardInput } from './user-ward-input';

export function UserSignupForm({ onSession, onVerified }: UseUserSignupFormOptions = {}) {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    step,
    isLoading,
    isVerifyingOtp,
    isResending,
    sendError,
    clearSendError,
    detailsForm,
    otpForm,
    phoneDisplay,
    maxWard,
    goBackToDetails,
    resendOtp,
    stepsActions,
  } = useUserSignupForm({ onSession, onVerified });

  const onPressSignIn = useCallback(() => {
    router.push('/user-auth/user-login-screen');
  }, [router]);

  return (
    <View className="flex-1">
      <View className="mt-8 flex-1">
        {step === 'details' ? (
          <ScrollView
            className="flex-1"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerClassName="gap-4 pb-4"
          >
            <Controller
              control={detailsForm.control}
              name="phone"
              render={({ field, fieldState }) => (
                <UserMobileInput
                  value={field.value}
                  onChangeText={(text) =>
                    field.onChange(text.replace(/\D/g, '').slice(0, MOBILE_NUMBER_LENGTH))
                  }
                  maxLength={MOBILE_NUMBER_LENGTH}
                  error={fieldState.error?.message}
                  disabled={isLoading}
                />
              )}
            />

            <Controller
              control={detailsForm.control}
              name="name"
              render={({ field, fieldState }) => (
                <UserTextInput
                  label={t('auth.fullName')}
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder={t('auth.fullNamePlaceholder')}
                  autoCapitalize="words"
                  autoComplete="name"
                  textContentType="name"
                  error={fieldState.error?.message}
                  disabled={isLoading}
                />
              )}
            />

            <Controller
              control={detailsForm.control}
              name="email"
              render={({ field, fieldState }) => (
                <UserEmailInput
                  value={field.value}
                  onChangeText={field.onChange}
                  error={fieldState.error?.message}
                  disabled={isLoading}
                />
              )}
            />

            <Controller
              control={detailsForm.control}
              name="holdingNumber"
              render={({ field, fieldState }) => (
                <UserTextInput
                  label={t('auth.holdingNumber')}
                  value={field.value}
                  onChangeText={(text) => field.onChange(text.slice(0, 120))}
                  placeholder={t('auth.holdingPlaceholder')}
                  error={fieldState.error?.message}
                  disabled={isLoading}
                  maxLength={120}
                />
              )}
            />

            <Controller
              control={detailsForm.control}
              name="wardNumber"
              render={({ field, fieldState }) => (
                <UserWardInput
                  value={field.value}
                  onValueChange={field.onChange}
                  maxWard={maxWard}
                  error={fieldState.error?.message}
                  disabled={isLoading}
                />
              )}
            />

            {sendError ? (
              <Typography className="px-1 text-sm text-destructive">{sendError}</Typography>
            ) : null}
          </ScrollView>
        ) : (
          <View className="gap-4">
            <Controller
              control={otpForm.control}
              name="otp"
              render={({ field, fieldState }) => (
                <UserOtpInput
                  value={field.value}
                  onChangeText={(text) => {
                    field.onChange(text);
                    clearSendError();
                  }}
                  error={fieldState.error?.message}
                  cellCount={OTP_LENGTH}
                  phoneDisplay={phoneDisplay}
                  onChangePhone={goBackToDetails}
                  disabled={isVerifyingOtp || isResending}
                  onResend={resendOtp}
                />
              )}
            />
            {sendError ? (
              <Typography className="px-1 text-sm text-destructive">{sendError}</Typography>
            ) : null}
          </View>
        )}
      </View>

      <Button
        disabled={isLoading}
        className="mt-auto h-14 rounded-lg bg-primary"
        onPress={stepsActions.onPress}
      >
        <Typography className="text-lg font-bold text-white">
          {isLoading ? stepsActions.loadingText : stepsActions.title}
        </Typography>
      </Button>

      <View className="mt-4 flex-row flex-wrap items-center justify-center gap-1">
        <Typography className="text-sm text-muted-foreground">{t('auth.alreadyRegistered')}</Typography>
        <Pressable onPress={onPressSignIn} disabled={isLoading} hitSlop={8}>
          <Typography className="text-sm font-semibold text-primary">{t('auth.signInLink')}</Typography>
        </Pressable>
      </View>
    </View>
  );
}
