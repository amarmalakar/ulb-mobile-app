import { useNetworkContext } from '@/components/provider/network-provider';
import {
  fetchStaffInfo,
  useStaffInfoQuery,
} from '@/features/staff-auth/hooks/use-staff-auth-queries';
import { staffQueryKeys } from '@/features/staff-auth/query-keys';
import type { StaffAuthSession, StaffInfo } from '@/features/staff-auth/types/index';
import {
  clearStaffSession,
  loadStaffSession,
  persistStaffSession,
} from '@/lib/staff-auth-storage';
import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type StaffAuthContextValue = {
  session: StaffAuthSession | null;
  sessionHydrated: boolean;
  mpinUnlocked: boolean;
  staffInfo: StaffInfo | undefined;
  isStaffInfoLoading: boolean;
  staffInfoError: Error | null;
  setSession: (session: StaffAuthSession | null) => Promise<void>;
  completeMpin: () => Promise<StaffInfo>;
  signOut: () => Promise<void>;
  refetchStaffInfo: () => void;
};

const StaffAuthContext = createContext<StaffAuthContextValue | undefined>(undefined);

export function StaffAuthProvider({ children }: { children: ReactNode }) {
  const { client, queryClient } = useNetworkContext();
  const [session, setSessionState] = useState<StaffAuthSession | null>(null);
  const [sessionHydrated, setSessionHydrated] = useState(false);
  const [mpinUnlocked, setMpinUnlocked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const stored = await loadStaffSession();
        if (!cancelled) {
          setSessionState(stored);
        }
      } catch {
        if (!cancelled) setSessionState(null);
      } finally {
        if (!cancelled) setSessionHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setSession = useCallback(async (next: StaffAuthSession | null) => {
    if (next) {
      await persistStaffSession(next);
      setSessionState(next);
      setMpinUnlocked(false);
    } else {
      await clearStaffSession();
      setSessionState(null);
      setMpinUnlocked(false);
      queryClient.removeQueries({ queryKey: staffQueryKeys.all });
    }
  }, [queryClient]);

  const signOut = useCallback(async () => {
    await setSession(null);
  }, [setSession]);

  const completeMpin = useCallback(async () => {
    const token = session?.accessToken;
    if (!token) {
      throw new Error('Missing staff session');
    }
    const info = await queryClient.fetchQuery({
      queryKey: staffQueryKeys.info(token),
      queryFn: () => fetchStaffInfo(client, token),
    });
    setMpinUnlocked(true);
    return info;
  }, [client, queryClient, session?.accessToken]);

  const staffInfoQuery = useStaffInfoQuery(
    mpinUnlocked ? session?.accessToken : null,
  );

  const value = useMemo<StaffAuthContextValue>(
    () => ({
      session,
      sessionHydrated,
      mpinUnlocked,
      staffInfo: staffInfoQuery.data,
      isStaffInfoLoading: staffInfoQuery.isLoading,
      staffInfoError: staffInfoQuery.error,
      setSession,
      completeMpin,
      signOut,
      refetchStaffInfo: () => {
        void staffInfoQuery.refetch();
      },
    }),
    [
      session,
      sessionHydrated,
      mpinUnlocked,
      staffInfoQuery.data,
      staffInfoQuery.isLoading,
      staffInfoQuery.error,
      staffInfoQuery.refetch,
      setSession,
      completeMpin,
      signOut,
    ],
  );

  return (
    <StaffAuthContext.Provider value={value}>{children}</StaffAuthContext.Provider>
  );
}

export function useStaffAuth() {
  const context = useContext(StaffAuthContext);
  if (!context) {
    throw new Error('useStaffAuth must be used within StaffAuthProvider');
  }
  return context;
}
