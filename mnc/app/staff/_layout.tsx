import { useStaffAuth } from '@/components/providers/staff-auth-provider';
import { type Href, Stack, useRouter } from 'expo-router';

const STAFF_LOGIN_HREF = '/staff-auth/staff-login-screen' as Href;
const STAFF_MPIN_HREF = '/staff-auth/staff-mpin-screen' as Href;
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function StaffLayout() {
  const router = useRouter();
  const { session, sessionHydrated, mpinUnlocked } = useStaffAuth();

  useEffect(() => {
    if (!sessionHydrated) return;

    if (!session?.accessToken) {
      router.replace(STAFF_LOGIN_HREF);
      return;
    }

    if (!mpinUnlocked) {
      router.replace(STAFF_MPIN_HREF);
    }
  }, [session, sessionHydrated, mpinUnlocked, router]);

  if (!sessionHydrated || !session?.accessToken || !mpinUnlocked) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
