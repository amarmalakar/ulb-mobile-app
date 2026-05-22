import { useUserAuth } from '@/components/provider/user-auth-provider';
import { Stack } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { HomeBanner } from '@/features/home-banner';
import { BottomNav } from '@/components/common/bottom-nav';
import { Text } from '@/components/ui/text';

export default function UserHomeScreen() {
  const { userInfo } = useUserAuth();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-background flex-1">
        <ScrollView showsVerticalScrollIndicator={false}>
          <HomeBanner userName={userInfo?.name ?? 'User'} />


          <Text className="text-2xl font-bold">Lorem ipsum dolor sit amet consectetur. Adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Text>
          <Text className="text-2xl font-bold">Lorem ipsum dolor sit amet consectetur. Adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Text>
          <Text className="text-2xl font-bold">Lorem ipsum dolor sit amet consectetur. Adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Text>
        </ScrollView>

        <BottomNav activeItemId="home" />
      </View>
    </>
  );
}
