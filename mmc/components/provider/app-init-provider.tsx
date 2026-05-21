import { NoConnectionScreen } from '@/components/no-connection-screen';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useNetworkContext } from './network-provider';
import { useQuery } from '@tanstack/react-query';
import { Text } from '@/components/ui/text';
import { type iUlb, useGetUlbById } from '@/hooks/apis/use-ulb-queries';

type AppInitContextValue = {
  isOnline: boolean;
  ulb?: iUlb;
  wards: number[];
};

const AppInitContext = createContext<AppInitContextValue | undefined>(undefined);

type AppInitProviderProps = {
  children: ReactNode;
};

export function AppInitProvider({ children }: AppInitProviderProps) {
  const { isOnline } = useNetworkStatus();

  if (!isOnline) {
    return <NoConnectionScreen />;
  }

  const { ulb, wards, isLoading, isError, error } = useGetUlbById();

  const value = useMemo(() => ({
    isOnline,
    ulb,
    wards
  }), [
    isOnline,
    ulb,
    wards
  ]);

  return (
    <AppInitContext.Provider value={{ isOnline, ulb, wards }}>
      {children}
      {/* <Text>AA: {JSON.stringify(ulb, null, 2)}</Text>
      <Text>{JSON.stringify({ isLoading, isError, error }, null, 2)}</Text> */}
    </AppInitContext.Provider>
  );
}

export function useAppInitContext() {
  const context = useContext(AppInitContext);
  if (!context) {
    throw new Error('useAppInitContext must be used within an AppInitProvider');
  }
  return context;
}
