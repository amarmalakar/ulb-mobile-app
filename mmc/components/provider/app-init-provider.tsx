import { NoConnectionScreen } from '@/components/no-connection-screen';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { createContext, useContext, type ReactNode } from 'react';

type AppInitContextValue = {
  isOnline: boolean;
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

  return (
    <AppInitContext.Provider value={{ isOnline }}>{children}</AppInitContext.Provider>
  );
}

export function useAppInitContext() {
  const context = useContext(AppInitContext);
  if (!context) {
    throw new Error('useAppInitContext must be used within an AppInitProvider');
  }
  return context;
}
