import { Stack, router } from 'expo-router';
import {
  Image,
  Keyboard,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StaffAuthSession } from '@/features/staff-auth/types/index';

import { Button } from '@/components/ui/button';
import { Typography } from '@/components/common/typography';

import { ArrowLeftIcon } from 'lucide-react-native';

import { useAuthContext } from '@/components/providers/auth-provider';
import { useStaffAuth } from '@/components/providers/staff-auth-provider';
import { useUserAuth } from '@/components/providers/user-auth-provider';

import bubbleShape1 from '@/assets/images/bubble-shape-1.png';
import loginHero from '@/assets/images/login-hero.png';
import StaffAuth from '@/features/staff-auth';

const STAFF_HOME_HREF = '/staff/home-screen';

export default function StaffLoginScreen() {
  const { clearAuthType, handleAuthType } = useAuthContext();
  const { setSession } = useStaffAuth();
  const { setSession: setUserSession } = useUserAuth();
  const insets = useSafeAreaInsets();

  const handleVerified = async (session: StaffAuthSession) => {
    await setUserSession(null);
    await setSession(session);
    await handleAuthType('Staff');
    router.replace(STAFF_HOME_HREF);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-background flex-1">
        <View pointerEvents="none" className="absolute -left-24 -top-20 size-80">
          <Image
            source={bubbleShape1}
            resizeMode="contain"
            className="size-80 opacity-70"
          />
        </View>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View
            className="flex-1 px-6 pt-20"
            style={{ paddingBottom: insets.bottom + 32 }}
          >
              <View className="">
                <Button
                  onPress={clearAuthType}
                  variant="ghost"
                  className="absolute left-0 z-10 aspect-square rounded-full bg-primary/20 shadow-lg"
                >
                  <ArrowLeftIcon size={20} className="" />
                </Button>

                <Typography variant="h4" weight="extrabold" align="center">
                  Staff Login
                </Typography>
              </View>

              <Image source={loginHero} resizeMode="contain" className="mt-10 h-48 w-full" />

              <StaffAuth onVerified={handleVerified} />
          </View>
        </TouchableWithoutFeedback>
      </View>
    </>
  );
}
