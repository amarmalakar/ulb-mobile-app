import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Typography } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import { MOBILE_NUMBER_LENGTH } from '../constants';
interface UserMobileInputProps {
  value: string;
  onChangeText: (value: string) => void;
  error?: string | null;
  disabled?: boolean;
  maxLength?: number;
}

export function UserMobileInput({
  value,
  onChangeText,
  error,
  disabled = false,
  maxLength = MOBILE_NUMBER_LENGTH,
}: UserMobileInputProps) {
  const { t } = useTranslation();
  const hasError = Boolean(error);
  const [focused, setFocused] = useState(false);

  return (
    <View className="gap-2">
      <Label>{t('common.mobileNumber')}</Label>

      <View
        className={cn(
          "overflow-hidden rounded-3xl border bg-muted/30 shadow-sm shadow-black/5",
          hasError && "border-destructive",
          !hasError && focused && "border-primary/60 bg-primary/5",
          !hasError && !focused && "border-border"
        )}
        style={{ opacity: disabled ? 0.5 : 1 }}
      >
        <View className="flex-row items-stretch">
          <View className="justify-center bg-background/80 px-3 py-3">
            <View className="flex-row items-center gap-2 rounded-2xl border border-border/80 bg-muted/50 px-3 py-1.5">
              <Typography className="text-xl leading-none">🇮🇳</Typography>
              <Typography className="text-foreground font-semibold tabular-nums">+91</Typography>
            </View>
          </View>

          <View className="my-3 w-px bg-border" />

          <Input
            editable={!disabled}
            accessibilityLabel={t('common.mobileNumber')}
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={t('auth.mobilePlaceholder')}
            keyboardType="number-pad"
            inputMode="numeric"
            maxLength={maxLength}
            autoComplete="tel"
            textContentType="telephoneNumber"
            aria-invalid={hasError}
            className="min-h-[52px] flex-1 border-0 bg-transparent px-4 py-3 text-lg font-medium tabular-nums shadow-none"
          />
        </View>
      </View>

      {hasError ? (
        <Typography className="px-1 text-sm text-destructive">{error}</Typography>
      ) : (
        <Typography className="px-1 text-xs leading-relaxed text-muted-foreground">
          {t('auth.mobileHint')}
        </Typography>
      )}
    </View>
  );
}
