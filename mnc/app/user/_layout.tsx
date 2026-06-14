import { useUserAuth } from '@/components/providers/user-auth-provider';
import { type Href, Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

const USER_LOGIN_HREF = '/user-auth/user-login-screen' as Href;
const USER_MPIN_HREF = '/user-auth/user-mpin-screen' as Href;

export default function UserLayout() {
  const router = useRouter();
  const { session, sessionHydrated, mpinUnlocked } = useUserAuth();

  useEffect(() => {
    if (!sessionHydrated) return;

    if (!session?.refreshToken) {
      router.replace(USER_LOGIN_HREF);
      return;
    }

    if (!mpinUnlocked) {
      router.replace(USER_MPIN_HREF);
    }
  }, [session, sessionHydrated, mpinUnlocked, router]);

  if (!sessionHydrated || !session?.refreshToken || !mpinUnlocked) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
