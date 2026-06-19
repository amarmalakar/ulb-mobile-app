import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  AlertCircleIcon,
  CheckCircle2Icon,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthContext } from '@/components/providers/auth-provider';
import { useStaffAuth } from '@/components/providers/staff-auth-provider';
import { useUserAuth } from '@/components/providers/user-auth-provider';
import { Alert as UiAlert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Typography } from '@/components/common/typography';
import { FeedbackAndSuggestionFormFields } from '@/features/feedback-and-suggestion-form/components/feedback-and-suggestion-form-fields';
import { useCreateFeedbackAndSuggestionMutation } from '@/features/feedback-and-suggestion-form/hooks/use-create-feedback-and-suggestion-mutation';
import { useFeedbackAndSuggestionForm } from '@/features/feedback-and-suggestion-form/hooks/use-feedback-and-suggestion-form';

export default function FeedbackAndSuggestionForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { authType } = useAuthContext();
  const { session: userSession, userInfo, isUserInfoLoading } = useUserAuth();
  const { session: staffSession, staffInfo, isStaffInfoLoading } = useStaffAuth();

  const isStaff = authType === 'Staff';
  const session = isStaff ? staffSession : userSession;
  const isProfileLoading = isStaff ? isStaffInfoLoading : isUserInfoLoading;
  const hasProfile = isStaff ? Boolean(staffInfo?.id) : Boolean(userInfo?.id);

  const form = useFeedbackAndSuggestionForm();
  const createMutation = useCreateFeedbackAndSuggestionMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);

    if (!session?.accessToken) {
      setSubmitError(t('feedback.signInRequired'));
      return;
    }

    if (!hasProfile) {
      setSubmitError(t('feedback.profileNotReady'));
      return;
    }

    try {
      const result = await createMutation.mutateAsync({
        kind: values.kind,
        title: values.title,
        message: values.message,
      });

      setSubmittedId(result.id);
      form.reset({ kind: values.kind, title: '', message: '' });
    } catch (error) {
      const message = error instanceof Error ? error.message : t('feedback.submitFailed');
      setSubmitError(message);
    }
  });

  if (isProfileLoading && !hasProfile) {
    return (
      <View className="flex-1 gap-4 p-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-36 w-full rounded-xl" />
        <Typography className="text-center text-sm text-muted-foreground">
          {t('feedback.loadingProfile')}
        </Typography>
      </View>
    );
  }

  if (submittedId) {
    return (
      <View className="flex-1 justify-center gap-6 p-4">
        <View className="items-center gap-3">
          <View className="rounded-full bg-primary/15 p-4">
            <Icon as={CheckCircle2Icon} className="size-10 text-primary" />
          </View>
          <Typography className="text-center text-xl font-semibold text-foreground">
            {t('feedback.submitSuccessTitle')}
          </Typography>
          <Typography className="text-center text-sm leading-6 text-muted-foreground">
            {t('feedback.submitSuccessBody')}
          </Typography>
        </View>

        <View className="gap-2">
          <Button size="lg" onPress={() => setSubmittedId(null)}>
            <Typography>{t('feedback.submitAnother')}</Typography>
          </Button>
          <Button size="lg" variant="outline" onPress={() => router.back()}>
            <Typography>{t('feedback.close')}</Typography>
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-4 pb-4 pt-2"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <Typography className="text-sm leading-6 text-muted-foreground">{t('feedback.subtitle')}</Typography>

        {submitError ? (
          <UiAlert icon={AlertCircleIcon} variant="destructive">
            <AlertTitle>{t('feedback.submitFailed')}</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </UiAlert>
        ) : null}

        <FeedbackAndSuggestionFormFields form={form} />
      </ScrollView>

      <View
        className="gap-2 border-t border-border bg-background px-4 py-3"
        style={{ paddingBottom: insets.bottom }}
      >
        <Button
          size="lg"
          disabled={createMutation.isPending || isProfileLoading}
          onPress={() => void handleSubmit()}
        >
          {createMutation.isPending ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator color="#fff" />
              <Typography>{t('feedback.submitting')}</Typography>
            </View>
          ) : (
            <Typography>{t('feedback.submit')}</Typography>
          )}
        </Button>
      </View>
    </View>
  );
}
