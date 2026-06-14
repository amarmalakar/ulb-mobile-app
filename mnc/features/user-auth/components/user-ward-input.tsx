import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const maxLength =
    maxWard != null && maxWard > 0 ? String(maxWard).length : 4;
  const helperText =
    maxWard != null && maxWard > 0
      ? t('auth.wardHelperRange', { max: maxWard })
      : t('auth.wardHelper');

  return (
    <UserTextInput
      label={t('auth.wardLabel')}
      value={value}
      onChangeText={(text) => onValueChange(text.replace(/\D/g, '').slice(0, maxLength))}
      placeholder={maxWard ? t('auth.wardRange', { max: maxWard }) : t('auth.wardPlaceholder')}
      keyboardType="number-pad"
      inputMode="numeric"
      error={error}
      disabled={disabled}
      maxLength={maxLength}
      helperText={helperText}
    />
  );
}
