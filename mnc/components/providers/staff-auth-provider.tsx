import { useNetworkContext } from '@/components/providers/network-provider';
import {
  useStaffInfoQuery,
  useStaffLogoutMutation,
} from '@/features/staff-auth/hooks/use-staff-auth-queries';
import { staffQueryKeys } from '@/features/staff-auth/query-keys';
import type { StaffAuthSession, StaffInfo, StaffSessionRefreshData } from '@/features/staff-auth/types/index';
import { throwUnlessOk } from '@/features/staff-auth/utils/api-response';
import { isApiError } from '@/lib/api-client';
import { loadAuthTypeFromStorage } from '@/lib/auth-type-storage';
import { API_PATHS } from '@/lib/api-paths';
import {
  clearStaffSession,
  loadStaffSession,
  persistStaffSession,
} from '@/lib/staff-auth-storage';
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
  staffInfo: StaffInfo | undefined;
  isStaffInfoLoading: boolean;
  staffInfoError: Error | null;
  setSession: (session: StaffAuthSession | null) => Promise<void>;
  updateSessionTokens: (tokens: {
    accessToken: string;
    refreshToken?: string;
  }) => Promise<StaffAuthSession | null>;
  signOut: () => Promise<void>;
  refetchStaffInfo: () => void;
};

const StaffAuthContext = createContext<StaffAuthContextValue | undefined>(undefined);

export function StaffAuthProvider({ children }: { children: ReactNode }) {
  const { client, queryClient } = useNetworkContext();
  const logoutMutation = useStaffLogoutMutation();
  const [session, setSessionState] = useState<StaffAuthSession | null>(null);
  const [sessionHydrated, setSessionHydrated] = useState(false);
  const [activeForStaff, setActiveForStaff] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const authType = await loadAuthTypeFromStorage();
        const isStaff = authType === 'Staff';
        if (!cancelled) {
          setActiveForStaff(isStaff);
        }

        if (!isStaff) {
          if (!cancelled) setSessionState(null);
          return;
        }

        const stored = await loadStaffSession();
        if (!stored) {
          if (!cancelled) setSessionState(null);
          return;
        }

        if (stored.refreshToken) {
          try {
            const res = (await client.post(API_PATHS.staff.sessionRefresh, {
              refreshToken: stored.refreshToken,
            })) as { ok?: boolean; data?: StaffSessionRefreshData; message?: string };
            const data = throwUnlessOk(res, 'Session refresh failed');
            const next: StaffAuthSession = {
              ...stored,
              accessToken: data.accessToken,
            };
            await persistStaffSession(next);
            if (!cancelled) setSessionState(next);
          } catch (refreshError) {
            if (isApiError(refreshError) && refreshError.status === 401) {
              await clearStaffSession();
              if (!cancelled) setSessionState(null);
            } else {
              if (!cancelled) setSessionState(stored);
            }
          }
          return;
        }

        if (!cancelled) setSessionState(stored);
      } catch {
        if (!cancelled) setSessionState(null);
      } finally {
        if (!cancelled) setSessionHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

  const setSession = useCallback(
    async (next: StaffAuthSession | null) => {
      if (next) {
        setActiveForStaff(true);
        await persistStaffSession(next);
        setSessionState(next);
      } else {
        setActiveForStaff(false);
        await clearStaffSession();
        setSessionState(null);
        queryClient.removeQueries({ queryKey: staffQueryKeys.all });
      }
    },
    [queryClient],
  );

  const updateSessionTokens = useCallback(
    async (tokens: { accessToken: string; refreshToken?: string }) => {
      const current = session ?? (await loadStaffSession());
      if (!current) return null;
      const next: StaffAuthSession = {
        ...current,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken ?? current.refreshToken,
      };
      await persistStaffSession(next);
      setSessionState(next);
      return next;
    },
    [session],
  );

  const signOut = useCallback(async () => {
    const current = session ?? (await loadStaffSession());
    const refreshToken = current?.refreshToken;
    if (refreshToken) {
      try {
        await logoutMutation.mutateAsync({ refreshToken });
      } catch {
        // Clear local session even if logout API fails
      }
    }
    await setSession(null);
  }, [logoutMutation, session, setSession]);

  const staffInfoQuery = useStaffInfoQuery(
    activeForStaff ? session?.accessToken : null,
  );

  const value = useMemo<StaffAuthContextValue>(
    () => ({
      session,
      sessionHydrated,
      staffInfo: staffInfoQuery.data,
      isStaffInfoLoading: staffInfoQuery.isLoading,
      staffInfoError: staffInfoQuery.error,
      setSession,
      updateSessionTokens,
      signOut,
      refetchStaffInfo: () => {
        void staffInfoQuery.refetch();
      },
    }),
    [
      session,
      sessionHydrated,
      staffInfoQuery.data,
      staffInfoQuery.isLoading,
      staffInfoQuery.error,
      staffInfoQuery.refetch,
      setSession,
      updateSessionTokens,
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
