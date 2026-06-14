import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, type TextInputProps, View } from "react-native";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import { Label } from "../../../components/ui/label";
import { Text } from "../../../components/ui/text";
import { cn } from "../../../lib/utils";
import { OTP_EXPIRY_SECONDS, OTP_LENGTH } from "../constants";
import type { Contact } from "../types";
import { formatContactDisplay } from "../utils/contact";
import { useOtpCountdown } from "../hooks/use-otp-countdown";

const autoComplete = Platform.select<TextInputProps["autoComplete"]>({
  android: "sms-otp",
  default: "one-time-code",
});

interface StaffOtpInputProps {
  value: string;
  onChangeText: (value: string) => void;
  contact: Contact;
  onChangeContact: () => void;
  error?: string | null;
  disabled?: boolean;
  cellCount?: number;
  expiresInSeconds?: number;
  onResend?: () => void;
}

export function StaffOtpInput({
  value,
  onChangeText,
  contact,
  onChangeContact,
  error,
  disabled = false,
  cellCount = OTP_LENGTH,
  expiresInSeconds = OTP_EXPIRY_SECONDS,
  onResend,
}: StaffOtpInputProps) {
  const { t } = useTranslation();
  const setValue = useCallback(
    (next: string) => {
      const digitsOnly = next.replace(/\D/g, "").slice(0, cellCount);
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
    resetKey: contact.value,
  });

  const hasError = Boolean(error);
  const sentToLabel = formatContactDisplay(contact);
  const changeLabel =
    contact.kind === "email" ? t("auth.changeEmail") : t("auth.changeMobile");
  const isPhoneContact = contact.kind === "phone";

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between gap-3 px-1">
        <Label>{t("common.verificationCode")}</Label>

        <Pressable
          onPress={onChangeContact}
          disabled={disabled}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={changeLabel}
          className={cn(
            "rounded-full px-2 py-1 active:bg-primary/10",
            disabled && "opacity-50"
          )}
        >
          <Text className="text-primary text-sm font-semibold">{changeLabel}</Text>
        </Pressable>
      </View>

      {sentToLabel ? (
        <Text className="text-muted-foreground px-1 text-sm">
          {isPhoneContact ? (
            <Text>
              {t("auth.staffDemoOtp", { code: "000000", contact: sentToLabel })}
            </Text>
          ) : (
            <Text>
              {t("auth.staffOtpSentTo", { contact: sentToLabel })}
            </Text>
          )}
        </Text>
      ) : null}

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
          flexDirection: "row",
          justifyContent: "space-between",
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
              "h-14 flex-1 items-center justify-center overflow-hidden rounded-2xl border bg-muted/30 shadow-sm shadow-black/5",
              hasError && "border-destructive",
              !hasError && isFocused && "border-primary/60 bg-primary/5",
              !hasError && !isFocused && "border-border"
            )}
          >
            <Text className="text-foreground text-2xl font-semibold tabular-nums">
              {symbol || (isFocused ? <Cursor /> : null)}
            </Text>
          </View>
        )}
      />

      {hasError ? (
        <Text className="text-destructive px-1 text-sm">{error}</Text>
      ) : isExpired ? (
        <View className="flex-row items-center gap-1 px-1">
          <Text className="text-muted-foreground text-xs">
            {t("auth.resendPrompt")}
          </Text>
          <Pressable
            onPress={handleResend}
            disabled={disabled}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={t("auth.resendOtp")}
            className={cn(
              "rounded-full px-1.5 py-0.5 active:bg-primary/10",
              disabled && "opacity-50"
            )}
          >
            <Text className="text-primary text-xs font-semibold">
              {t("auth.resendOtp")}
            </Text>
          </Pressable>
        </View>
      ) : (
        <Text
          className={cn(
            "px-1 text-xs leading-relaxed tabular-nums",
            isUrgent ? "text-destructive font-medium" : "text-muted-foreground"
          )}
        >
          {t("auth.otpExpiresIn", { time: countdownLabel })}
        </Text>
      )}
    </View>
  );
}
