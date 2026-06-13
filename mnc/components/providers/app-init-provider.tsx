import { type iUlb, useGetUlbById } from '@/hooks/apis/use-ulb-queries';
import { useNetworkContext } from '@/components/providers/network-provider';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

type AppInitContextValue = {
  ulb?: iUlb;
  wards: number[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
};

const AppInitContext = createContext<AppInitContextValue | undefined>(undefined);

type AppInitProviderProps = {
  children: ReactNode;
};

export function AppInitProvider({ children }: AppInitProviderProps) {
  const { ulb, wards, isLoading, isError, error } = useGetUlbById();

  const value = useMemo(
    () => ({
      ulb,
      wards,
      isLoading,
      isError,
      error: error ?? null,
    }),
    [ulb, wards, isLoading, isError, error],
  );

  return <AppInitContext.Provider value={value}>{children}</AppInitContext.Provider>;
}

export function useAppInitContext() {
  const context = useContext(AppInitContext);
  if (!context) {
    throw new Error('useAppInitContext must be used within an AppInitProvider');
  }
  return context;
}
