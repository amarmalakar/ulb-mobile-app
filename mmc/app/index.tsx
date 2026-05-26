import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Typography } from '@/components/ui/typography';
import { Stack } from 'expo-router';
import { MoonStarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Image, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import bubbleShape1 from '@/assets/images/bubble-shape-1.png';
import loginHero from '@/assets/images/login-hero.png';
import { useAppInitContext } from '@/components/provider/app-init-provider';
import { useAuthContext } from '@/components/provider/auth-provider';
import { useStaffBootstrap } from '@/hooks/use-staff-bootstrap';
import { useUserBootstrap } from '@/hooks/use-user-bootstrap';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const SCREEN_OPTIONS = {
  headerShown: false,
};

export default function Screen() {
  const { t } = useTranslation();
  const { ulb } = useAppInitContext();
  const { currentStep } = useAuthContext();
  const insets = useSafeAreaInsets();
  useStaffBootstrap();
  useUserBootstrap();

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View className="bg-background flex-1">
        <Image
          source={bubbleShape1}
          resizeMode="contain"
          className="absolute -left-24 -top-20 size-80 opacity-70"
        />

        <View
          className="flex-1 px-6 pt-16"
          style={{ paddingBottom: insets.bottom + 32 }}
        >
          <View className="flex-1 items-center justify-center">
            <Image source={loginHero} resizeMode="contain" className="h-72 w-full max-w-[280px]" />

            <Typography variant="h4" align="center" className="mt-10">
              {t('welcome.tagline', { ulb: ulb?.key ?? '' })}
            </Typography>

            <Typography variant="body1" color="muted" align="center" className="mt-5 max-w-[320px]">
              {t('welcome.description')}
            </Typography>
          </View>

          <View className="gap-3">
            {currentStep?.map((step, index) => {
              const isEven = index % 2 === 0;
              return (
                <Button
                  key={step.title}
                  onPress={step.onPress}
                  variant={isEven ? "outline" : "default"}
                  className={cn("h-14 rounded-2xl", isEven ? "border-primary" : "")}
                >
                  <Typography variant="h5" className={cn(isEven ? "text-primary" : "text-white")}>{step.title}</Typography>
                </Button>
              )
            })}
          </View>
        </View>
      </View>
    </>
  );
}

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <Button
      onPressIn={toggleColorScheme}
      size="icon"
      variant="ghost"
      className="ios:size-9 rounded-full web:mx-4">
      <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-5" />
    </Button>
  );
}
