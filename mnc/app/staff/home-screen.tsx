import { useStaffAuth } from '@/components/providers/staff-auth-provider';
import { useAuthContext } from '@/components/providers/auth-provider';
import { Typography } from '@/components/common/typography';
import { Button } from '@/components/ui/button';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { BottomNav } from '@/components/common/bottom-nav';

export default function StaffHomeScreen() {
  const { t } = useTranslation();
  const { staffInfo } = useStaffAuth();
  const { logout, isLoggingOut } = useAuthContext();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-background flex-1 pb-28">
        <ScrollView showsVerticalScrollIndicator={false}>
          <Typography variant="h3" align="center" className='mt-16'>Staff Home Screen</Typography>
        </ScrollView>

        <BottomNav activeItemId="home" />
      </View>
    </>
  );
}
