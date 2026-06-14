import { useStaffAuth } from '@/components/providers/staff-auth-provider';
import { useAuthContext } from '@/components/providers/auth-provider';
import { Typography } from '@/components/common/typography';
import { Button } from '@/components/ui/button';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

export default function StaffHomeScreen() {
  const { t } = useTranslation();
  const { staffInfo } = useStaffAuth();
  const { logout, isLoggingOut } = useAuthContext();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 items-center justify-center gap-6 bg-background px-6">
        <Typography variant="h3" align="center">
          {t('nav.home')} Staff Home Screen
        </Typography>
        <Typography variant="body1" color="muted" align="center">
          {t('welcome.welcomeStaff', { name: staffInfo?.name ?? t('common.staff') })}
        </Typography>
        <Button onPress={() => void logout()} disabled={isLoggingOut}>
          <Typography color="primary-foreground">{t('account.logout')}</Typography>
        </Button>
      </View>
    </>
  );
}
