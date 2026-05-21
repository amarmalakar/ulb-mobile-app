import { useCallback } from 'react';
import { Controller } from 'react-hook-form';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import {
  useUserSigninForm,
  type UseUserSigninFormOptions,
} from '../hooks/use-user-signin-form';
import { UserMobileInput } from './user-mobile-input';

export function UserSigninForm({
  onSession,
  onSignedIn,
}: UseUserSigninFormOptions = {}) {
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
    router.push('/(user-auth)/user-signup-screen');
  }, [router]);

  return (
    <View className="flex-1">
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
          <Text className="px-1 text-sm text-destructive">{submitError}</Text>
        ) : null}
      </View>

      <Button
        disabled={isLoading}
        className="mt-auto h-14 rounded-lg bg-primary"
        onPress={submit}
      >
        <Text className="text-lg font-bold text-white">
          {isLoading ? buttonLoading : buttonTitle}
        </Text>
      </Button>

      <View className="mt-4 flex-row flex-wrap items-center justify-center gap-1">
        <Text className="text-sm text-muted-foreground">New here?</Text>
        <Pressable onPress={onPressSignUp} disabled={isLoading} hitSlop={8}>
          <Text className="text-sm font-semibold text-primary">Create account</Text>
        </Pressable>
      </View>
    </View>
  );
}
