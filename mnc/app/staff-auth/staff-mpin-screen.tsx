import { type Href, Stack, router } from 'expo-router';

const STAFF_HOME_HREF = '/staff/home-screen' as Href;
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import { useStaffAuth } from '@/components/providers/staff-auth-provider';

import { Typography } from '@/components/common/typography';
import { Button } from '@/components/ui/button';
import { StaffMpin } from '@/features/staff-auth/components/staff-mpin';

export default function StaffMpinScreen() {
  const { t } = useTranslation();
  const { session, sessionHydrated, mpinUnlocked, completeMpin } = useStaffAuth();
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionHydrated) return;
    if (!session?.accessToken) {
      router.replace('./staff-login-screen');
      return;
    }
    if (mpinUnlocked) {
      router.replace(STAFF_HOME_HREF);
    }
  }, [session, sessionHydrated, mpinUnlocked]);

  const onComplete = useCallback(async () => {
    setCompleting(true);
    setCompleteError(null);
    try {
      await completeMpin();
      router.replace(STAFF_HOME_HREF);
    } catch {
      setCompleteError(t('auth.profileLoadError'));
      setCompleting(false);
    }
  }, [completeMpin, t]);

  if (!sessionHydrated || completing) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 items-center justify-center bg-background">
          <ActivityIndicator size="large" />
          {completing ? (
            <Typography variant="body2" color="muted" className="mt-4">{t('auth.loadingProfile')}</Typography>
          ) : null}
        </View>
      </>
    );
  }

  if (!session?.accessToken) {
    return null;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {completeError ? (
        <View className="absolute inset-x-6 bottom-8 z-10 gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <Typography variant="body2" color="destructive" align="center">{completeError}</Typography>
          <Button variant="outline" onPress={() => void onComplete()}>
            <Typography>{t('common.retry')}</Typography>
          </Button>
        </View>
      ) : null}
      <StaffMpin accessToken={session.accessToken} onComplete={() => void onComplete()} />
    </>
  );
}
