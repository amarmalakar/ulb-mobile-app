import { UserTextInput } from './user-text-input';

type UserWardInputProps = {
  value: string;
  onValueChange: (value: string) => void;
  maxWard?: number;
  error?: string | null;
  disabled?: boolean;
};

export function UserWardInput({
  value,
  onValueChange,
  maxWard,
  error,
  disabled = false,
}: UserWardInputProps) {
  const maxLength =
    maxWard != null && maxWard > 0 ? String(maxWard).length : 4;
  const helperText =
    maxWard != null && maxWard > 0
      ? `Enter a ward number from 1 to ${maxWard}.`
      : 'Enter your ward number.';

  return (
    <UserTextInput
      label="Ward number"
      value={value}
      onChangeText={(text) => onValueChange(text.replace(/\D/g, '').slice(0, maxLength))}
      placeholder={maxWard ? `1–${maxWard}` : 'e.g. 12'}
      keyboardType="number-pad"
      inputMode="numeric"
      error={error}
      disabled={disabled}
      maxLength={maxLength}
      helperText={helperText}
    />
  );
}
