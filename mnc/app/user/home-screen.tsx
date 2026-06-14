import { useUserAuth } from '@/components/providers/user-auth-provider';
import { useAuthContext } from '@/components/providers/auth-provider';
import { Typography } from '@/components/common/typography';
import { Button } from '@/components/ui/button';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { BottomNav } from '@/components/common/bottom-nav';
import { HomeBanner } from '@/features/home-banner';

export default function UserHomeScreen() {
  const { t } = useTranslation();
  const { userInfo } = useUserAuth();
  const { logout, isLoggingOut } = useAuthContext();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-background flex-1 pb-28">
        <ScrollView showsVerticalScrollIndicator={false}>
          <HomeBanner userName={userInfo?.name ?? t('common.user')} />
          <Typography variant="h3" align="center" className='mt-16'>User Home Screen</Typography>
        </ScrollView>

        <BottomNav activeItemId="home" />
      </View>
    </>
  );
}
