import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  type TextInputProps,
  View,
} from "react-native";

import { KeyboardFormScroll } from "@/components/common/keyboard-form-scroll";
import { useSessionExpiredLogout } from "@/hooks/use-logout";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";

import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { Text } from "../../../components/ui/text";
import { cn } from "../../../lib/utils";
import { MPIN_LENGTH, OTP_LENGTH } from "../constants";
import { useUserMpinFlow } from "../hooks/use-user-mpin-flow";

const autoComplete = Platform.select<TextInputProps["autoComplete"]>({
  android: "sms-otp",
  default: "one-time-code",
});

function MpinCodeRow({
  value,
  onChangeText,
  length,
  label,
  error,
  disabled,
}: {
  value: string;
  onChangeText: (v: string) => void;
  length: number;
  label: string;
  error?: string | null;
  disabled?: boolean;
}) {
  const setValue = useCallback(
    (next: string) => {
      const digitsOnly = next.replace(/\D/g, "").slice(0, length);
      onChangeText(digitsOnly);
    },
    [length, onChangeText],
  );

  const ref = useBlurOnFulfill({ value, cellCount: length });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  const hasError = Boolean(error);

  return (
    <View className="gap-2">
      <Label>{label}</Label>
      <CodeField
        ref={ref}
        {...props}
        value={value}
        onChangeText={setValue}
        cellCount={length}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete={autoComplete}
        editable={!disabled}
        rootStyle={{
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 8,
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
              !hasError && !isFocused && "border-border",
            )}
          >
            <Text className="text-2xl font-semibold tabular-nums text-foreground">
              {symbol || (isFocused ? <Cursor /> : null)}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

export type UserMpinFormProps = {
  accessToken: string | null | undefined;
  refreshToken: string | null | undefined;
  onComplete: () => void;
  onSessionTokens: (tokens: { accessToken: string; refreshToken?: string }) => void | Promise<void>;
};

export function UserMpinForm({
  accessToken,
  refreshToken,
  onComplete,
  onSessionTokens,
}: UserMpinFormProps) {
  const { t } = useTranslation();

  if (!accessToken || !refreshToken) {
    return (
      <View className="mt-8 gap-2">
        <Text className="text-center text-sm text-destructive">
          {t("auth.missingSession")}
        </Text>
      </View>
    );
  }

  const flow = useUserMpinFlow(accessToken, refreshToken, onComplete, onSessionTokens);
  const sessionExpired = useSessionExpiredLogout(
    flow.statusQuery.isError ? flow.statusQuery.error : null,
  );

  const primary = useMemo(() => {
    switch (flow.step) {
      case "create_mpin":
        return {
          label: t("auth.mpinContinue"),
          loading: t("auth.mpinSaving"),
          onPress: flow.submitCreate,
        };
      case "enter_mpin":
        return {
          label: t("auth.mpinContinue"),
          loading: t("auth.mpinVerifying"),
          onPress: flow.submitEnter,
        };
      case "reset_mpin":
        return {
          label: t("auth.mpinContinue"),
          loading: t("auth.mpinSaving"),
          onPress: flow.submitResetNew,
        };
      default:
        return null;
    }
  }, [t, flow.step, flow.submitCreate, flow.submitEnter, flow.submitResetNew]);

  if (flow.step === "loading") {
    return (
      <View className="mt-12 items-center gap-4">
        {flow.statusError && !sessionExpired ? (
          <>
            <Text className="text-center text-sm text-destructive">{flow.statusError}</Text>
            <Button onPress={() => void flow.refetchStatus()} variant="outline">
              <Text>{t("common.tryAgain")}</Text>
            </Button>
          </>
        ) : (
          <>
            <ActivityIndicator size="large" />
            <Text className="text-sm text-muted-foreground">{t("common.loading")}</Text>
          </>
        )}
      </View>
    );
  }

  if (flow.step === "locked") {
    const until = flow.statusQuery.data?.lockedUntil;
    return (
      <View className="mt-8 gap-4">
        <Text className="text-center text-base text-foreground">{t("auth.mpinLocked")}</Text>
        {until ? (
          <Text className="text-center text-xs text-muted-foreground">
            {t("auth.lockedUntil", { date: new Date(until).toLocaleString() })}
          </Text>
        ) : null}
        <Button onPress={() => void flow.refetchStatus()} variant="outline">
          <Text>{t("common.tryAgain")}</Text>
        </Button>
      </View>
    );
  }

  return (
    <KeyboardFormScroll>
      <View className="mt-8 flex-1 gap-6">
        {flow.step === "create_mpin" ? (
            <>
              <Text className="text-lg font-bold text-foreground">{t("auth.mpinTitleCreate")}</Text>
              <Text className="text-sm text-muted-foreground">{t("auth.mpinHelperCreate")}</Text>
              <MpinCodeRow
                label={t("auth.mpin")}
                length={MPIN_LENGTH}
                value={flow.createMpin}
                onChangeText={flow.setCreateMpin}
                error={null}
                disabled={flow.isBusy}
              />
              <MpinCodeRow
                label={t("auth.confirmMpin")}
                length={MPIN_LENGTH}
                value={flow.createConfirm}
                onChangeText={flow.setCreateConfirm}
                error={null}
                disabled={flow.isBusy}
              />
            </>
          ) : null}

          {flow.step === "enter_mpin" ? (
            <>
              <Text className="text-lg font-bold text-foreground">{t("auth.mpinTitleEnter")}</Text>
              <Text className="text-sm text-muted-foreground">{t("auth.mpinHelperEnter")}</Text>
              <MpinCodeRow
                label={t("auth.mpin")}
                length={MPIN_LENGTH}
                value={flow.enterMpin}
                onChangeText={flow.setEnterMpin}
                error={null}
                disabled={flow.isBusy}
              />
              <Pressable
                onPress={() => void flow.startReset()}
                disabled={flow.isBusy}
                className="self-center py-2 active:opacity-70"
              >
                <Text className="text-sm font-semibold text-primary">
                  {flow.resetRequestPending ? t("auth.mpinSendingReset") : t("auth.mpinReset")}
                </Text>
              </Pressable>
            </>
          ) : null}

          {flow.step === "reset_mpin" ? (
            <>
              <Text className="text-lg font-bold text-foreground">{t("auth.mpinTitleReset")}</Text>
              <Text className="text-sm text-muted-foreground">{t("auth.mpinHelperReset")}</Text>
              <MpinCodeRow
                label={t("auth.smsCode")}
                length={OTP_LENGTH}
                value={flow.resetOtp}
                onChangeText={flow.setResetOtp}
                error={null}
                disabled={flow.isBusy}
              />
              <MpinCodeRow
                label={t("auth.newMpin")}
                length={MPIN_LENGTH}
                value={flow.resetNew}
                onChangeText={flow.setResetNew}
                error={null}
                disabled={flow.isBusy}
              />
              <MpinCodeRow
                label={t("auth.confirmMpin")}
                length={MPIN_LENGTH}
                value={flow.resetNewConfirm}
                onChangeText={flow.setResetNewConfirm}
                error={null}
                disabled={flow.isBusy}
              />
              <Pressable
                onPress={flow.cancelReset}
                disabled={flow.isBusy}
                className="self-center py-2 active:opacity-70"
              >
                <Text className="text-sm font-medium text-muted-foreground">{t("auth.mpinBack")}</Text>
              </Pressable>
            </>
          ) : null}

          {flow.formError ? (
            <Text className="text-sm text-destructive">{flow.formError}</Text>
          ) : null}

          {primary ? (
            <Button
              disabled={flow.isBusy}
              className="mt-auto h-14 rounded-lg bg-primary"
              onPress={primary.onPress}
            >
              <Text className="text-lg font-bold text-white">
                {flow.isBusy ? primary.loading : primary.label}
              </Text>
            </Button>
          ) : null}
      </View>
    </KeyboardFormScroll>
  );
}
