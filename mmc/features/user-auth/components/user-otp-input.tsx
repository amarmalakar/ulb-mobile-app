import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, type TextInputProps, View } from 'react-native';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';

import { Label } from '@/components/ui/label';
import { Typography } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import { useOtpCountdown } from '@/features/staff-auth/hooks/use-otp-countdown';
import { OTP_EXPIRY_SECONDS, OTP_LENGTH } from '../constants';
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
  const { t } = useTranslation();
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
        <Label>{t('common.verificationCode')}</Label>
        <Pressable
          onPress={onChangePhone}
          disabled={disabled}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('auth.changeMobile')}
          className={cn(
            'rounded-full px-2 py-1 active:bg-primary/10',
            disabled && 'opacity-50',
          )}
        >
          <Typography className="text-sm font-semibold text-primary">
            {t('auth.changeMobile')}
          </Typography>
        </Pressable>
      </View>

      <Typography className="px-1 text-sm text-muted-foreground">
        {t('auth.otpHint')}{' '}
        <Typography className="font-semibold tracking-wide text-foreground">{phoneDisplay}</Typography>
      </Typography>

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
            <Typography className="text-2xl font-semibold tabular-nums text-foreground">
              {symbol || (isFocused ? <Cursor /> : null)}
            </Typography>
          </View>
        )}
      />

      {hasError ? (
        <Typography className="px-1 text-sm text-destructive">{error}</Typography>
      ) : isExpired ? (
        <View className="flex-row items-center gap-1 px-1">
          <Typography className="text-xs text-muted-foreground">{t('auth.resendPrompt')}</Typography>
          <Pressable
            onPress={handleResend}
            disabled={disabled}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={t('auth.resendOtp')}
            className={cn(
              'rounded-full px-1.5 py-0.5 active:bg-primary/10',
              disabled && 'opacity-50',
            )}
          >
            <Typography className="text-xs font-semibold text-primary">
              {t('auth.resendOtp')}
            </Typography>
          </Pressable>
        </View>
      ) : (
        <Typography
          className={cn(
            'px-1 text-xs leading-relaxed tabular-nums',
            isUrgent ? 'font-medium text-destructive' : 'text-muted-foreground',
          )}
        >
          {t('auth.otpExpiresIn', { time: countdownLabel })}
        </Typography>
      )}
    </View>
  );
}
