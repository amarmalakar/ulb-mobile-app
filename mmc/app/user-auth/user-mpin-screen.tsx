import { type Href, Stack, router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAuthContext } from '@/components/provider/auth-provider';
import { useUserAuth } from '@/components/provider/user-auth-provider';
import { UserMpinForm } from '@/features/user-auth/components/user-mpin-form';

import { ArrowLeftIcon } from 'lucide-react-native';

import bubbleShape1 from '@/assets/images/bubble-shape-1.png';
import loginHero from '@/assets/images/login-hero.png';

const USER_HOME_HREF = '/user/home-screen' as Href;
const USER_LOGIN_HREF = '/user-auth/user-login-screen' as Href;

export default function UserMpinScreen() {
  const { clearAuthType } = useAuthContext();
  const {
    session,
    sessionHydrated,
    mpinUnlocked,
    updateSessionTokens,
    completeMpin,
  } = useUserAuth();
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionHydrated) return;
    if (!session?.refreshToken) {
      router.replace(USER_LOGIN_HREF);
      return;
    }
    if (mpinUnlocked) {
      router.replace(USER_HOME_HREF);
    }
  }, [session, sessionHydrated, mpinUnlocked]);

  const finishToHome = useCallback(async () => {
    setCompleting(true);
    setCompleteError(null);
    try {
      await completeMpin();
      router.replace(USER_HOME_HREF);
    } catch {
      setCompleteError('Could not load your profile. Try again.');
      setCompleting(false);
    }
  }, [completeMpin]);

  if (!sessionHydrated || completing) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 items-center justify-center bg-background">
          <ActivityIndicator size="large" />
          {completing ? (
            <Text className="mt-4 text-sm text-muted-foreground">Loading profile…</Text>
          ) : null}
        </View>
      </>
    );
  }

  if (!session?.accessToken || !session?.refreshToken) {
    return null;
  }

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
          <View>
            <Button
              onPress={() => void clearAuthType()}
              variant="ghost"
              className="absolute left-0 z-10 aspect-square rounded-full bg-primary/20 shadow-lg"
            >
              <ArrowLeftIcon size={20} />
            </Button>

            <Text className="text-center text-xl font-extrabold text-foreground">
              User MPIN
            </Text>
          </View>

          <Image source={loginHero} resizeMode="contain" className="mt-10 h-48 w-full" />

          {completeError ? (
            <View className="mb-4 gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
              <Text className="text-center text-sm text-destructive">{completeError}</Text>
              <Button variant="outline" onPress={() => void finishToHome()}>
                <Text>Retry</Text>
              </Button>
            </View>
          ) : null}

          <UserMpinForm
            accessToken={session.accessToken}
            refreshToken={session.refreshToken}
            onComplete={() => void finishToHome()}
            onSessionTokens={async (tokens) => {
              await updateSessionTokens(tokens);
            }}
          />
        </View>
      </View>
    </>
  );
}
