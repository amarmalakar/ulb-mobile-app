import { useStaffAuth } from '@/components/provider/staff-auth-provider';
import { Stack } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { HomeBanner } from '@/features/home-banner';
import { BottomNav } from '@/components/common/bottom-nav';
import { StaffHomeDashboard } from '@/features/tickets/components/staff-home-dashboard';

export default function StaffHomeScreen() {
  const { staffInfo } = useStaffAuth();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-background flex-1">
        <ScrollView showsVerticalScrollIndicator={false}>
          <HomeBanner userName={staffInfo?.name ?? 'Staff'} />
          <StaffHomeDashboard />
        </ScrollView>

        <BottomNav activeItemId="home" />
      </View>
    </>
  );
}
