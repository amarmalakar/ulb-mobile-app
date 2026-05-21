import { useUserAuth } from '@/components/provider/user-auth-provider';
import { useAuthContext } from '@/components/provider/auth-provider';
import { useAppInitContext } from '@/components/provider/app-init-provider';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Stack } from 'expo-router';
import { LogOutIcon } from 'lucide-react-native';
import { View } from 'react-native';

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return phone;
}

export default function UserHomeScreen() {
  const { ulb } = useAppInitContext();
  const { userInfo, signOut, isUserInfoLoading } = useUserAuth();
  const { clearAuthType } = useAuthContext();

  const handleLogout = async () => {
    await signOut();
    clearAuthType();
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-background px-6 pb-8 pt-16">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xl font-extrabold text-foreground">Home</Text>
            {ulb?.name ? (
              <Text className="text-sm text-muted-foreground">{ulb.name}</Text>
            ) : null}
          </View>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-primary/10"
            onPress={() => void handleLogout()}
          >
            <LogOutIcon size={20} className="text-primary" />
          </Button>
        </View>

        <View className="mt-10 flex-1 gap-4">
          {isUserInfoLoading ? (
            <Text className="text-muted-foreground">Loading profile…</Text>
          ) : (
            <>
              <Text className="text-2xl font-bold text-foreground">
                Welcome, {userInfo?.name ?? 'User'}
              </Text>
              {userInfo?.phone ? (
                <Text className="text-base text-muted-foreground">
                  {formatPhone(userInfo.phone)}
                </Text>
              ) : null}
              {userInfo?.email ? (
                <Text className="text-sm text-muted-foreground">{userInfo.email}</Text>
              ) : null}
              {userInfo?.wardNumber != null ? (
                <Text className="text-sm text-muted-foreground">
                  Ward {userInfo.wardNumber}
                </Text>
              ) : null}
              {userInfo?.holdingNumber ? (
                <Text className="text-sm text-muted-foreground">
                  Holding {userInfo.holdingNumber}
                </Text>
              ) : null}
            </>
          )}
        </View>

        <Button
          variant="outline"
          className="h-14 rounded-2xl border-primary"
          onPress={() => void handleLogout()}
        >
          <Text className="font-semibold text-primary">Log out</Text>
        </Button>
      </View>
    </>
  );
}
