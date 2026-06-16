import { useStaffAuth } from '@/components/providers/staff-auth-provider';
import { type Href, Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

const STAFF_LOGIN_HREF = '/staff-auth/staff-login-screen' as Href;

export default function StaffLayout() {
  const router = useRouter();
  const { session, sessionHydrated } = useStaffAuth();

  useEffect(() => {
    if (!sessionHydrated) return;

    if (!session?.accessToken) {
      router.replace(STAFF_LOGIN_HREF);
    }
  }, [session, sessionHydrated, router]);

  if (!sessionHydrated || !session?.accessToken) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
