import { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  type TextInputProps,
  View,
} from "react-native";
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
import { MPIN_MESSAGES } from "../messages";
import { useStaffMpinFlow } from "../hooks/use-staff-mpin-flow";

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
            <Text className="text-foreground text-2xl font-semibold tabular-nums">
              {symbol || (isFocused ? <Cursor /> : null)}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

export type MpinFormProps = {
  accessToken: string | null | undefined;
  onComplete: () => void;
};

export function MpinForm({ accessToken, onComplete }: MpinFormProps) {
  if (!accessToken) {
    return (
      <View className="mt-8 gap-2">
        <Text className="text-destructive text-center text-sm">
          Missing session. Sign in again to set up your MPIN.
        </Text>
      </View>
    );
  }

  const flow = useStaffMpinFlow(accessToken, onComplete);

  const primary = useMemo(() => {
    switch (flow.step) {
      case "create_mpin":
        return {
          label: MPIN_MESSAGES.continue,
          loading: MPIN_MESSAGES.saving,
          onPress: flow.submitCreate,
        };
      case "enter_mpin":
        return {
          label: MPIN_MESSAGES.continue,
          loading: MPIN_MESSAGES.verifying,
          onPress: flow.submitEnter,
        };
      case "reset_mpin":
        return {
          label: MPIN_MESSAGES.continue,
          loading: MPIN_MESSAGES.saving,
          onPress: flow.submitResetNew,
        };
      default:
        return null;
    }
  }, [
    flow.step,
    flow.submitCreate,
    flow.submitEnter,
    flow.submitResetNew,
  ]);

  if (flow.step === "loading") {
    return (
      <View className="mt-12 items-center gap-4">
        {flow.statusError ? (
          <>
            <Text className="text-destructive text-center text-sm">
              {flow.statusError}
            </Text>
            <Button onPress={() => void flow.refetchStatus()} variant="outline">
              <Text>{MPIN_MESSAGES.refetchStatus}</Text>
            </Button>
          </>
        ) : (
          <>
            <ActivityIndicator size="large" />
            <Text className="text-muted-foreground text-sm">Loading…</Text>
          </>
        )}
      </View>
    );
  }

  if (flow.step === "locked") {
    const until = flow.statusQuery.data?.lockedUntil;
    return (
      <View className="mt-8 gap-4">
        <Text className="text-center text-base text-foreground">
          {MPIN_MESSAGES.locked}
        </Text>
        {until ? (
          <Text className="text-muted-foreground text-center text-xs">
            Locked until {new Date(until).toLocaleString()}
          </Text>
        ) : null}
        <Button onPress={() => void flow.refetchStatus()} variant="outline">
          <Text>{MPIN_MESSAGES.refetchStatus}</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="mt-8 flex-1 gap-6">
      {flow.step === "create_mpin" ? (
        <>
          <Text className="text-foreground text-lg font-bold">
            {MPIN_MESSAGES.titleCreate}
          </Text>
          <Text className="text-muted-foreground text-sm">
            {MPIN_MESSAGES.helperCreate}
          </Text>
          <MpinCodeRow
            label="MPIN"
            length={MPIN_LENGTH}
            value={flow.createMpin}
            onChangeText={flow.setCreateMpin}
            error={null}
            disabled={flow.isBusy}
          />
          <MpinCodeRow
            label={MPIN_MESSAGES.confirmLabel}
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
          <Text className="text-foreground text-lg font-bold">
            {MPIN_MESSAGES.titleEnter}
          </Text>
          <Text className="text-muted-foreground text-sm">
            {MPIN_MESSAGES.helperEnter}
          </Text>
          <MpinCodeRow
            label="MPIN"
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
            <Text className="text-primary text-sm font-semibold">
              {flow.resetRequestPending
                ? MPIN_MESSAGES.sendingReset
                : MPIN_MESSAGES.resetMpin}
            </Text>
          </Pressable>
        </>
      ) : null}

      {flow.step === "reset_mpin" ? (
        <>
          <Text className="text-foreground text-lg font-bold">
            {MPIN_MESSAGES.titleReset}
          </Text>
          <Text className="text-muted-foreground text-sm">
            {MPIN_MESSAGES.helperReset}
          </Text>
          <MpinCodeRow
            label="Email code"
            length={OTP_LENGTH}
            value={flow.resetOtp}
            onChangeText={flow.setResetOtp}
            error={null}
            disabled={flow.isBusy}
          />
          <MpinCodeRow
            label="New MPIN"
            length={MPIN_LENGTH}
            value={flow.resetNew}
            onChangeText={flow.setResetNew}
            error={null}
            disabled={flow.isBusy}
          />
          <MpinCodeRow
            label={MPIN_MESSAGES.confirmLabel}
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
            <Text className="text-muted-foreground text-sm font-medium">
              {MPIN_MESSAGES.back}
            </Text>
          </Pressable>
        </>
      ) : null}

      {flow.formError ? (
        <Text className="text-destructive text-sm">{flow.formError}</Text>
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
  );
}
