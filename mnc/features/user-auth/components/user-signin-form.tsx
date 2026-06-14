import { useCallback } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { KeyboardFormScroll } from '@/components/common/keyboard-form-scroll';
import { useRouter } from 'expo-router';

import { Button } from '@/components/ui/button';
import { Typography } from '@/components/common/typography';
import {
  useUserSigninForm,
  type UseUserSigninFormOptions,
} from '../hooks/use-user-signin-form';
import { UserMobileInput } from './user-mobile-input';

export function UserSigninForm({
  onSession,
  onSignedIn,
}: UseUserSigninFormOptions = {}) {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    form,
    submitError,
    clearSubmitError,
    submit,
    isLoading,
    buttonTitle,
    buttonLoading,
    maxPhoneLength,
  } = useUserSigninForm({ onSession, onSignedIn });

  const onPressSignUp = useCallback(() => {
    router.push('/user-auth/user-signup-screen');
  }, [router]);

  return (
    <KeyboardFormScroll scrollViewProps={{ contentContainerClassName: 'flex-grow' }}>
      <View className="mt-12 gap-4">
        <Controller
          control={form.control}
          name="phone"
          render={({ field, fieldState }) => (
            <UserMobileInput
              value={field.value}
              onChangeText={(text) => {
                field.onChange(text.replace(/\D/g, '').slice(0, maxPhoneLength));
                clearSubmitError();
              }}
              maxLength={maxPhoneLength}
              error={fieldState.error?.message}
              disabled={isLoading}
            />
          )}
        />
        {submitError ? (
          <Typography variant="body2" color="destructive" className="px-1">{submitError}</Typography>
        ) : null}
      </View>

      <Button
        disabled={isLoading}
        className="mt-auto h-14 rounded-lg bg-primary"
        onPress={submit}
      >
        <Typography variant="h5" weight="bold" className="text-white">
          {isLoading ? buttonLoading : buttonTitle}
        </Typography>
      </Button>

      <View className="mt-4 flex-row flex-wrap items-center justify-center gap-1">
        <Typography variant="h6" color="muted">{t('auth.newHere')}</Typography>
        <Pressable onPress={onPressSignUp} disabled={isLoading} hitSlop={8}>
          <Typography variant="h6" color="primary">{t('auth.createAccount')}</Typography>
        </Pressable>
      </View>
    </KeyboardFormScroll>
  );
}
