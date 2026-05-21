import '@/global.css';

import { AppInitProvider } from '@/components/provider/app-init-provider';
import { NetworkProvider } from '@/components/provider/network-provider';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { DevToolsBubble } from 'react-native-react-query-devtools';
import { useNetworkContext } from '@/components/provider/network-provider';
import { AuthProvider } from '@/components/provider/auth-provider';

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

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <NetworkProvider>
        <AppInitProvider>
          <AuthProvider>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <Stack />
            <PortalHost />
            
            <QueryDevTools />
          </AuthProvider>
        </AppInitProvider>
      </NetworkProvider>
    </ThemeProvider>
  );
}
