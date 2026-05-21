import { NoConnectionScreen } from '@/components/no-connection-screen';
import { type iUlb, useGetUlbById } from '@/hooks/apis/use-ulb-queries';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

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
  const { ulb, wards } = useGetUlbById(isOnline);

  const value = useMemo(
    () => ({
      isOnline,
      ulb,
      wards,
    }),
    [isOnline, ulb, wards],
  );

  if (!isOnline) {
    return <NoConnectionScreen />;
  }

  return <AppInitContext.Provider value={value}>{children}</AppInitContext.Provider>;
}

export function useAppInitContext() {
  const context = useContext(AppInitContext);
  if (!context) {
    throw new Error('useAppInitContext must be used within an AppInitProvider');
  }
  return context;
}
