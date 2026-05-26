import '@/global.css';

import { AppInitProvider } from '@/components/provider/app-init-provider';
import { NetworkProvider } from '@/components/provider/network-provider';
import { geistFontMap } from '@/lib/fonts';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { DevToolsBubble } from 'react-native-react-query-devtools';
import { useNetworkContext } from '@/components/provider/network-provider';
import { LocaleProvider } from '@/components/provider/locale-provider';
import { AuthProvider } from '@/components/provider/auth-provider';
import { StaffAuthProvider } from '@/components/provider/staff-auth-provider';
import { UserAuthProvider } from '@/components/provider/user-auth-provider';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Hiding can fail when called multiple times during fast refresh.
});

function QueryDevTools() {
  const { queryClient } = useNetworkContext();
  return <DevToolsBubble queryClient={queryClient} />;
}

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

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
              <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
              <Stack screenOptions={{ headerShown: false }} />
              <PortalHost />
              <QueryDevTools />
            </AuthProvider>
            </UserAuthProvider>
          </StaffAuthProvider>
        </AppInitProvider>
      </NetworkProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
