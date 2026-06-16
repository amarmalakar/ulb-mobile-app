import { Stack, router } from 'expo-router';
import type { UserAuthSession } from '@/features/user-auth/types/index';
import { useUserAuth } from '@/components/providers/user-auth-provider';
import { useStaffAuth } from '@/components/providers/staff-auth-provider';
import { Image, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Typography } from '@/components/common/typography';
import { useAuthContext } from '@/components/providers/auth-provider';

import { ArrowLeftIcon } from 'lucide-react-native';

import bubbleShape1 from '@/assets/images/bubble-shape-1.png';
import loginHero from '@/assets/images/login-hero.png';
import { UserSignupForm } from '@/features/user-auth/components/user-signup-form';

const USER_HOME_HREF = '/user/home-screen';

export default function UserSignupScreen() {
  const { clearAuthType, handleAuthType } = useAuthContext();
  const { setSession } = useUserAuth();
  const { setSession: setStaffSession } = useStaffAuth();
  const insets = useSafeAreaInsets();

  const handleSession = async (session: UserAuthSession) => {
    await setStaffSession(null);
    await handleAuthType('User');
    await setSession(session);
    router.replace(USER_HOME_HREF);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-background">
        <Image
          source={bubbleShape1}
          resizeMode="contain"
          className="absolute -left-24 -top-20 size-80 opacity-70"
        />

        <View
          className="flex-1 px-6 pt-20"
          style={{ paddingBottom: insets.bottom + 32 }}
        >
            <View className="">
              <Button
                onPress={() => void clearAuthType()}
                variant="ghost"
                className="absolute left-0 z-10 aspect-square rounded-full bg-primary/20 shadow-lg"
              >
                <ArrowLeftIcon size={20} className="" />
              </Button>

              <Typography variant="h4" weight="extrabold" align="center">
                User Sign Up
              </Typography>
            </View>

            {/* <Image source={loginHero} resizeMode="contain" className="mt-10 h-48 w-full" /> */}

            <UserSignupForm onSession={handleSession} />
        </View>
      </View>
    </>
  );
}
