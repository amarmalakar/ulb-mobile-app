import { Controller, type UseFormReturn } from 'react-hook-form';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import type { FeedbackAndSuggestionFormValues } from '@/features/feedback-and-suggestion-form/schemas';
import { FEEDBACK_AND_SUGGESTION_KINDS } from '@/features/feedback-and-suggestion-form/types';

type FeedbackAndSuggestionFormFieldsProps = {
  form: UseFormReturn<FeedbackAndSuggestionFormValues>;
};

export function FeedbackAndSuggestionFormFields({ form }: FeedbackAndSuggestionFormFieldsProps) {
  const { t } = useTranslation();
  const {
    control,
    formState: { errors },
  } = form;

  return (
    <View className="gap-5">
      <View className="gap-2">
        <Label>{t('feedback.kindLabel')}</Label>
        <Controller
          control={control}
          name="kind"
          render={({ field: { onChange, value } }) => (
            <RadioGroup value={value} onValueChange={onChange}>
              <View className="gap-3">
                {FEEDBACK_AND_SUGGESTION_KINDS.map((kind) => {
                  const labelId = `feedback-kind-${kind.toLowerCase()}`;
                  const label =
                    kind === 'FEEDBACK'
                      ? t('feedback.kindFeedback')
                      : t('feedback.kindSuggestion');

                  return (
                    <View key={kind} className="flex-row items-center gap-2">
                      <RadioGroupItem value={kind} aria-labelledby={labelId} />
                      <Label
                        className="font-normal"
                        nativeID={labelId}
                        onPress={() => onChange(kind)}
                      >
                        {label}
                      </Label>
                    </View>
                  );
                })}
              </View>
            </RadioGroup>
          )}
        />
        {errors.kind ? (
          <Text className="text-destructive text-xs">{errors.kind.message}</Text>
        ) : null}
      </View>

      <View className="gap-2">
        <Label>{t('feedback.titleLabel')}</Label>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={t('feedback.titlePlaceholder')}
              maxLength={200}
              returnKeyType="next"
            />
          )}
        />
        {errors.title ? (
          <Text className="text-destructive text-xs">{errors.title.message}</Text>
        ) : null}
      </View>

      <View className="gap-2">
        <Label>{t('feedback.messageLabel')}</Label>
        <Controller
          control={control}
          name="message"
          render={({ field: { onChange, onBlur, value } }) => (
            <Textarea
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={t('feedback.messagePlaceholder')}
              className="min-h-36"
              maxLength={5000}
            />
          )}
        />
        {errors.message ? (
          <Text className="text-destructive text-xs">{errors.message.message}</Text>
        ) : null}
      </View>
    </View>
  );
}
