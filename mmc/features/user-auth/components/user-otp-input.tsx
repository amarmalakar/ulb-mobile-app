import { useCallback } from 'react';
import { Platform, Pressable, type TextInputProps, View } from 'react-native';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';

import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useOtpCountdown } from '@/features/staff-auth/hooks/use-otp-countdown';
import { HELPER_MESSAGES } from '@/features/staff-auth/messages';
import { OTP_EXPIRY_SECONDS, OTP_LENGTH } from '../constants';
import { USER_AUTH_MESSAGES } from '../messages';

const autoComplete = Platform.select<TextInputProps['autoComplete']>({
  android: 'sms-otp',
  default: 'one-time-code',
});

export type UserOtpInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  phoneDisplay: string;
  onChangePhone: () => void;
  error?: string | null;
  disabled?: boolean;
  cellCount?: number;
  expiresInSeconds?: number;
  onResend?: () => void;
};

export function UserOtpInput({
  value,
  onChangeText,
  phoneDisplay,
  onChangePhone,
  error,
  disabled = false,
  cellCount = OTP_LENGTH,
  expiresInSeconds = OTP_EXPIRY_SECONDS,
  onResend,
}: UserOtpInputProps) {
  const setValue = useCallback(
    (next: string) => {
      const digitsOnly = next.replace(/\D/g, '').slice(0, cellCount);
      onChangeText(digitsOnly);
    },
    [cellCount, onChangeText],
  );

  const ref = useBlurOnFulfill({ value, cellCount });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  const {
    isExpired,
    isUrgent,
    formatted: countdownLabel,
    handleResend,
  } = useOtpCountdown({
    expiresInSeconds,
    onResend,
    disabled,
    resetKey: phoneDisplay,
  });

  const hasError = Boolean(error);

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between gap-3 px-1">
        <Label>Verification code</Label>
        <Pressable
          onPress={onChangePhone}
          disabled={disabled}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={USER_AUTH_MESSAGES.changeMobile}
          className={cn(
            'rounded-full px-2 py-1 active:bg-primary/10',
            disabled && 'opacity-50',
          )}
        >
          <Text className="text-sm font-semibold text-primary">
            {USER_AUTH_MESSAGES.changeMobile}
          </Text>
        </Pressable>
      </View>

      <Text className="px-1 text-sm text-muted-foreground">
        {USER_AUTH_MESSAGES.otpHint}{' '}
        <Text className="font-semibold tracking-wide text-foreground">{phoneDisplay}</Text>
      </Text>

      <CodeField
        ref={ref}
        {...props}
        value={value}
        onChangeText={setValue}
        cellCount={cellCount}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete={autoComplete}
        editable={!disabled}
        rootStyle={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 8,
          minHeight: 56,
          opacity: disabled ? 0.5 : 1,
        }}
        renderCell={({ index, symbol, isFocused }) => (
          <View
            key={index}
            pointerEvents="none"
            onLayout={getCellOnLayoutHandler(index)}
            className={cn(
              'h-14 flex-1 items-center justify-center overflow-hidden rounded-2xl border bg-muted/30 shadow-sm shadow-black/5',
              hasError && 'border-destructive',
              !hasError && isFocused && 'border-primary/60 bg-primary/5',
              !hasError && !isFocused && 'border-border',
            )}
          >
            <Text className="text-2xl font-semibold tabular-nums text-foreground">
              {symbol || (isFocused ? <Cursor /> : null)}
            </Text>
          </View>
        )}
      />

      {hasError ? (
        <Text className="px-1 text-sm text-destructive">{error}</Text>
      ) : isExpired ? (
        <View className="flex-row items-center gap-1 px-1">
          <Text className="text-xs text-muted-foreground">{HELPER_MESSAGES.resendPrompt}</Text>
          <Pressable
            onPress={handleResend}
            disabled={disabled}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={USER_AUTH_MESSAGES.resendOtp}
            className={cn(
              'rounded-full px-1.5 py-0.5 active:bg-primary/10',
              disabled && 'opacity-50',
            )}
          >
            <Text className="text-xs font-semibold text-primary">
              {USER_AUTH_MESSAGES.resendOtp}
            </Text>
          </Pressable>
        </View>
      ) : (
        <Text
          className={cn(
            'px-1 text-xs leading-relaxed tabular-nums',
            isUrgent ? 'font-medium text-destructive' : 'text-muted-foreground',
          )}
        >
          OTP expires in {countdownLabel}
        </Text>
      )}
    </View>
  );
}
