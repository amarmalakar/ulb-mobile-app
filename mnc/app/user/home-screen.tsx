import { useUserAuth } from '@/components/providers/user-auth-provider';
import { useAuthContext } from '@/components/providers/auth-provider';
import { Typography } from '@/components/common/typography';
import { Button } from '@/components/ui/button';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

export default function UserHomeScreen() {
  const { t } = useTranslation();
  const { userInfo } = useUserAuth();
  const { logout, isLoggingOut } = useAuthContext();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 items-center justify-center gap-6 bg-background px-6">
        <Typography variant="h3" align="center">
          {t('nav.home')} User Home Screen
        </Typography>
        <Typography variant="body1" color="muted" align="center">
          {t('welcome.welcomeUser', { name: userInfo?.name ?? t('common.user') })}
        </Typography>
        <Button onPress={() => void logout()} disabled={isLoggingOut}>
          <Typography color="primary-foreground">{t('account.logout')}</Typography>
        </Button>
      </View>
    </>
  );
}
