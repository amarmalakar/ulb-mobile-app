import '@/global.css';

import { useEffect } from 'react';
import { geistFontMap } from '@/lib/fonts';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { DevToolsBubble } from 'react-native-react-query-devtools';

import { AppErrorScreen } from '@/components/common/app-error-screen';
import { AppLoadingScreen } from '@/components/common/app-loading-screen';
import { AppInitProvider, useAppInitContext } from '@/components/providers/app-init-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { LocaleProvider } from '@/components/providers/locale-provider';
import { NetworkProvider, useNetworkContext } from '@/components/providers/network-provider';
import { StaffAuthProvider } from '@/components/providers/staff-auth-provider';
import { UserAuthProvider } from '@/components/providers/user-auth-provider';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Hiding can fail when called multiple times during fast refresh.
});

export {
  ErrorBoundary,
} from 'expo-router';

function QueryDevTools() {
  const { queryClient } = useNetworkContext();
  return <DevToolsBubble queryClient={queryClient} />;
}

function LayoutContext() {
  const { colorScheme } = useColorScheme();
  const { isLoading, isError, error, refetch } = useAppInitContext();

  if (isLoading) {
    return <AppLoadingScreen />;
  }

  if (isError) {
    return (
      <AppErrorScreen
        message={error?.message}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }} />
      <PortalHost />
      <QueryDevTools />
    </>
  );
}

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const [fontsLoaded, fontError] = useFonts(geistFontMap);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <LocaleProvider>
        <NetworkProvider>
          <AppInitProvider>
            <StaffAuthProvider>
              <UserAuthProvider>
                <AuthProvider>
                  <LayoutContext />
                </AuthProvider>
              </UserAuthProvider>
            </StaffAuthProvider>
          </AppInitProvider>
        </NetworkProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
