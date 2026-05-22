import { useUserAuth } from '@/components/provider/user-auth-provider';
import { Stack } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { HomeBanner } from '@/features/home-banner';
import { BottomNav } from '@/components/common/bottom-nav';
import { Text } from '@/components/ui/text';
import { ComplaintList } from '@/features/complaints/components/complaint-list';

export default function UserHomeScreen() {
  const { userInfo } = useUserAuth();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-background flex-1">
        <ScrollView showsVerticalScrollIndicator={false}>
          <HomeBanner userName={userInfo?.name ?? 'User'} />

          <ComplaintList />
        </ScrollView>

        <BottomNav activeItemId="home" />
      </View>
    </>
  );
}
