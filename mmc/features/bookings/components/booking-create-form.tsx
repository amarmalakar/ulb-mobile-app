import { Controller, type UseFormReturn } from 'react-hook-form';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Text } from '@/components/ui/text';
import type { BookingFormValues } from '@/features/bookings/hooks/use-booking-form';
import { MOBILE_NUMBER_LENGTH } from '@/features/user-auth/constants';

type BookingCreateFormProps = {
  form: UseFormReturn<BookingFormValues>;
  showDurationDays: boolean;
  durationLabel?: string;
};

export function BookingCreateForm({
  form,
  showDurationDays,
  durationLabel,
}: BookingCreateFormProps) {
  const { t } = useTranslation();
  const {
    control,
    formState: { errors },
  } = form;

  return (
    <View className="gap-4">
      <View className="flex-row gap-3">
        <View className="flex-1 gap-2">
          <Label>{t('bookings.contactName')}</Label>
          <Controller
            control={control}
            name="contactName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('bookings.contactNamePlaceholder')}
                autoComplete="name"
              />
            )}
          />
          {errors.contactName ? (
            <Text className="text-destructive text-xs">{errors.contactName.message}</Text>
          ) : null}
        </View>

        <View className="flex-1 gap-2">
          <Label>{t('bookings.contactPhone')}</Label>
          <Controller
            control={control}
            name="contactPhone"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                value={value}
                onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, MOBILE_NUMBER_LENGTH))}
                onBlur={onBlur}
                placeholder={t('bookings.contactPhonePlaceholder')}
                keyboardType="number-pad"
                maxLength={MOBILE_NUMBER_LENGTH}
              />
            )}
          />
          {errors.contactPhone ? (
            <Text className="text-destructive text-xs">{errors.contactPhone.message}</Text>
          ) : null}
        </View>
      </View>

      {showDurationDays ? (
        <View className="gap-2">
          <Label>{durationLabel ?? t('bookings.durationDays')}</Label>
          <Controller
            control={control}
            name="durationDays"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                value={value}
                onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, 3))}
                onBlur={onBlur}
                keyboardType="number-pad"
                placeholder="1"
              />
            )}
          />
          {errors.durationDays ? (
            <Text className="text-destructive text-xs">{errors.durationDays.message}</Text>
          ) : null}
        </View>
      ) : null}

      <View className="gap-2">
        <Label>{t('bookings.purpose')}</Label>
        <Controller
          control={control}
          name="purpose"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={t('bookings.purposePlaceholder')}
            />
          )}
        />
      </View>

      <View className="gap-2">
        <Label>{t('bookings.guestCount')}</Label>
        <Controller
          control={control}
          name="guestCount"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              value={value ?? ''}
              onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, 4))}
              onBlur={onBlur}
              keyboardType="number-pad"
              placeholder={t('bookings.optional')}
            />
          )}
        />
        {errors.guestCount ? (
          <Text className="text-destructive text-xs">{errors.guestCount.message}</Text>
        ) : null}
      </View>

      <View className="gap-2">
        <Label>{t('bookings.notes')}</Label>
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, onBlur, value } }) => (
            <Textarea
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={t('bookings.notesPlaceholder')}
              className="min-h-24 rounded-xl"
            />
          )}
        />
      </View>
    </View>
  );
}
