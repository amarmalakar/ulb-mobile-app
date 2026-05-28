import { createApiClient } from '@/lib/api-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AxiosInstance } from 'axios';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { Platform } from 'react-native';

interface NetworkContextType {
  queryClient: QueryClient;
  client: AxiosInstance;
  ulbId: string;
  apiBaseUrl: string;
}

export const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const ulbId = process.env.EXPO_PUBLIC_ULB_ID!;
  // const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL!;
  const apiBaseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:4000/api/v2' : 'http://localhost:4000/api/v2';

  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
          },
        },
      }),
    [],
  );

  const client = useMemo(
    () => createApiClient({ baseURL: apiBaseUrl, ulbId }),
    [apiBaseUrl, ulbId],
  );

  const value = useMemo(
    () => ({ queryClient, client, ulbId, apiBaseUrl }),
    [queryClient, client, ulbId, apiBaseUrl],
  );

  return (
    <NetworkContext.Provider value={value}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </NetworkContext.Provider>
  );
}

export function useNetworkContext() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetworkContext must be used within an NetworkProvider');
  }
  return context;
}
