import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

import { TopNavigation } from '@/components/common/top-navigation';
import FeedbackAndSuggestionForm from '@/features/feedback-and-suggestion-form';

export default function FeedbackAndSuggestionCreateScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-background">
        <TopNavigation label={t('feedback.createTitle')} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <FeedbackAndSuggestionForm />
        </KeyboardAvoidingView>
      </View>
    </>
  );
}
