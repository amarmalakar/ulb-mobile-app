import { useState, type ReactNode } from 'react';
import { View } from 'react-native';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Typography } from '@/components/common/typography';
import { cn } from '@/lib/utils';

type UserTextInputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string | null;
  disabled?: boolean;
  placeholder?: string;
  helperText?: string;
  maxLength?: number;
  keyboardType?: 'default' | 'email-address' | 'number-pad';
  inputMode?: 'text' | 'numeric' | 'email';
  autoCapitalize?: 'none' | 'words' | 'sentences';
  autoComplete?: 'email' | 'name' | 'off';
  textContentType?: 'emailAddress' | 'name' | 'none';
  leading?: ReactNode;
};

export function UserTextInput({
  label,
  value,
  onChangeText,
  error,
  disabled = false,
  placeholder,
  helperText,
  maxLength,
  keyboardType = 'default',
  inputMode,
  autoCapitalize = 'sentences',
  autoComplete = 'off',
  textContentType = 'none',
  leading,
}: UserTextInputProps) {
  const hasError = Boolean(error);
  const [focused, setFocused] = useState(false);

  return (
    <View className="gap-2">
      <Label>{label}</Label>

      <View
        className={cn(
          'overflow-hidden rounded-3xl border bg-muted/30 shadow-sm shadow-black/5',
          hasError && 'border-destructive',
          !hasError && focused && 'border-primary/60 bg-primary/5',
          !hasError && !focused && 'border-border',
        )}
        style={{ opacity: disabled ? 0.5 : 1 }}
      >
        <View className="flex-row items-stretch">
          {leading ? (
            <>
              <View className="justify-center bg-background/80 px-3 py-3">{leading}</View>
              <View className="my-3 w-px bg-border" />
            </>
          ) : null}

          <Input
            editable={!disabled}
            accessibilityLabel={label}
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            keyboardType={keyboardType}
            inputMode={inputMode}
            autoCapitalize={autoCapitalize}
            autoCorrect={false}
            maxLength={maxLength}
            autoComplete={autoComplete}
            textContentType={textContentType}
            aria-invalid={hasError}
            className="min-h-[52px] flex-1 border-0 bg-transparent px-4 py-3 text-lg font-medium shadow-none"
          />
        </View>
      </View>

      {hasError ? (
        <Typography variant="body2" color="destructive" className="px-1">{error}</Typography>
      ) : helperText ? (
        <Typography variant="caption" color="muted" className="px-1 leading-relaxed">{helperText}</Typography>
      ) : null}
    </View>
  );
}
