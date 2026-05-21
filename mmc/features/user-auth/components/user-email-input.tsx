import { useState } from 'react';
import { View } from 'react-native';
import { MailIcon } from 'lucide-react-native';

import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { EMAIL_MAX_LENGTH } from '../constants';

type UserEmailInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  error?: string | null;
  disabled?: boolean;
  maxLength?: number;
};

export function UserEmailInput({
  value,
  onChangeText,
  error,
  disabled = false,
  maxLength = EMAIL_MAX_LENGTH,
}: UserEmailInputProps) {
  const hasError = Boolean(error);
  const [focused, setFocused] = useState(false);

  return (
    <View className="gap-2">
      <Label>Email (optional)</Label>

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
          <View className="justify-center bg-background/80 px-3 py-3">
            <View className="h-9 w-12 items-center justify-center rounded-2xl border border-border/80 bg-muted/50">
              <Icon as={MailIcon} className="text-foreground" size={18} />
            </View>
          </View>

          <View className="my-3 w-px bg-border" />

          <Input
            editable={!disabled}
            accessibilityLabel="Email"
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="you@example.com"
            keyboardType="email-address"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            maxLength={maxLength}
            autoComplete="email"
            textContentType="emailAddress"
            aria-invalid={hasError}
            className="min-h-[52px] flex-1 border-0 bg-transparent px-4 py-3 text-lg font-medium shadow-none"
          />
        </View>
      </View>

      {hasError ? (
        <Text className="px-1 text-sm text-destructive">{error}</Text>
      ) : (
        <Text className="px-1 text-xs leading-relaxed text-muted-foreground">
          Optional — for receipts and updates.
        </Text>
      )}
    </View>
  );
}
