import { Stack, router } from "expo-router";
import type { UserAuthSession } from "@/features/user-auth/types/index";
import { useUserAuth } from '@/components/provider/user-auth-provider';
import { Image, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useAuthContext } from "@/components/provider/auth-provider";

import { ArrowLeftIcon } from "lucide-react-native";

import bubbleShape1 from "@/assets/images/bubble-shape-1.png";
import loginHero from "@/assets/images/login-hero.png";
import { UserSigninForm } from "@/features/user-auth/components/user-signin-form";

export default function UserLoginScreen() {
  const { clearAuthType, handleAuthType } = useAuthContext();
  const { setSession } = useUserAuth();

  const handleSession = async (session: UserAuthSession) => {
    await handleAuthType('User');
    await setSession(session);
    router.replace('./user-mpin-screen');
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

        <View className="flex-1 px-6 pb-8 pt-20">
          <View className="">
            <Button
              onPress={() => void clearAuthType()}
              variant="ghost"
              className="absolute left-0 z-10 aspect-square rounded-full bg-primary/20 shadow-lg"
            >
              <ArrowLeftIcon size={20} className="" />
            </Button>

            <Text className="text-center text-xl font-extrabold text-foreground">
              User Login
            </Text>
          </View>

          <Image source={loginHero} resizeMode="contain" className="mt-10 h-48 w-full" />

          <UserSigninForm onSession={handleSession} />

        </View>
      </View>
    </>
  );
}