import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Stack } from 'expo-router';
import { MoonStarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Image, View } from 'react-native';
import bubbleShape1 from '@/assets/images/bubble-shape-1.png';
import loginHero from '@/assets/images/login-hero.png';
import { useAppInitContext } from '@/components/provider/app-init-provider';
import { useAuthContext } from '@/components/provider/auth-provider';
import { useStaffBootstrap } from '@/hooks/use-staff-bootstrap';
import { useUserBootstrap } from '@/hooks/use-user-bootstrap';
import { cn } from '@/lib/utils';

const SCREEN_OPTIONS = {
  headerShown: false,
};

export default function Screen() {
  const { ulb } = useAppInitContext();
  const { currentStep } = useAuthContext();
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

        <View className="flex-1 px-6 pb-8 pt-16">
          <View className="flex-1 items-center justify-center">
            <Image source={loginHero} resizeMode="contain" className="h-72 w-full max-w-[280px]" />

            <Text className="mt-10 text-center text-xl font-extrabold text-foreground">
              Get things with <Text className="text-primary text-xl font-extrabold">{ulb?.key}</Text>
            </Text>

            <Text className="text-muted-foreground mt-5 max-w-[320px] text-center">
              Lorem ipsum dolor sit amet consectetur. Eget sit nec et euismod. Consequat urna quam felis interdum quisque. Malesuada adipiscing tristique ut eget sed.
            </Text>
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
                  <Text className={cn("font-semibold text-lg", isEven ? "text-primary" : "")}>{step.title}</Text>
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
