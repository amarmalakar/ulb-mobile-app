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

import { LocaleProvider } from '@/components/providers/locale-provider';
import { AppInitProvider } from '@/components/providers/app-init-provider';
import { NetworkProvider, useNetworkContext } from '@/components/providers/network-provider';
import { DevToolsBubble } from 'react-native-react-query-devtools';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Hiding can fail when called multiple times during fast refresh.
});

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

function QueryDevTools() {
  const { queryClient } = useNetworkContext();
  return <DevToolsBubble queryClient={queryClient} />;
}

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const [fontsLoaded, fontError] = useFonts(geistFontMap);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => { });
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
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <Stack />
            <PortalHost />
            <QueryDevTools />
          </AppInitProvider>
        </NetworkProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
