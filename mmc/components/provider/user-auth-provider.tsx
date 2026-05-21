import { useNetworkContext } from '@/components/provider/network-provider';
import {
  fetchUserInfo,
  useUserInfoQuery,
  useUserLogoutMutation,
} from '@/features/user-auth/hooks/use-user-auth-queries';
import { userQueryKeys } from '@/features/user-auth/query-keys';
import type { UserAuthSession, UserInfo } from '@/features/user-auth/types/index';
import {
  clearUserSession,
  loadUserSession,
  persistUserSession,
} from '@/lib/user-auth-storage';
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

type UserAuthContextValue = {
  session: UserAuthSession | null;
  sessionHydrated: boolean;
  mpinUnlocked: boolean;
  userInfo: UserInfo | undefined;
  isUserInfoLoading: boolean;
  userInfoError: Error | null;
  setSession: (session: UserAuthSession | null) => Promise<void>;
  updateSessionTokens: (tokens: {
    accessToken: string;
    refreshToken?: string;
  }) => Promise<UserAuthSession | null>;
  completeMpin: () => Promise<UserInfo>;
  signOut: () => Promise<void>;
  refetchUserInfo: () => void;
};

const UserAuthContext = createContext<UserAuthContextValue | undefined>(undefined);

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const { client, queryClient } = useNetworkContext();
  const logoutMutation = useUserLogoutMutation();
  const [session, setSessionState] = useState<UserAuthSession | null>(null);
  const [sessionHydrated, setSessionHydrated] = useState(false);
  const [mpinUnlocked, setMpinUnlocked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const stored = await loadUserSession();
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

  const setSession = useCallback(
    async (next: UserAuthSession | null) => {
      if (next) {
        await persistUserSession(next);
        setSessionState(next);
        setMpinUnlocked(false);
      } else {
        await clearUserSession();
        setSessionState(null);
        setMpinUnlocked(false);
        queryClient.removeQueries({ queryKey: userQueryKeys.all });
      }
    },
    [queryClient],
  );

  const updateSessionTokens = useCallback(
    async (tokens: { accessToken: string; refreshToken?: string }) => {
      const current = session ?? (await loadUserSession());
      if (!current) return null;
      const next: UserAuthSession = {
        ...current,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken ?? current.refreshToken,
      };
      await persistUserSession(next);
      setSessionState(next);
      return next;
    },
    [session],
  );

  const signOut = useCallback(async () => {
    const refreshToken = session?.refreshToken;
    if (refreshToken) {
      try {
        await logoutMutation.mutateAsync({ refreshToken });
      } catch {
        // Clear local session even if logout API fails
      }
    }
    await setSession(null);
  }, [logoutMutation, session?.refreshToken, setSession]);

  const completeMpin = useCallback(async () => {
    const token = session?.accessToken;
    if (!token) {
      throw new Error('Missing user session');
    }
    const info = await queryClient.fetchQuery({
      queryKey: userQueryKeys.info(token),
      queryFn: () => fetchUserInfo(client, token),
    });
    setMpinUnlocked(true);
    return info;
  }, [client, queryClient, session?.accessToken]);

  const userInfoQuery = useUserInfoQuery(mpinUnlocked ? session?.accessToken : null);

  const value = useMemo<UserAuthContextValue>(
    () => ({
      session,
      sessionHydrated,
      mpinUnlocked,
      userInfo: userInfoQuery.data,
      isUserInfoLoading: userInfoQuery.isLoading,
      userInfoError: userInfoQuery.error,
      setSession,
      updateSessionTokens,
      completeMpin,
      signOut,
      refetchUserInfo: () => {
        void userInfoQuery.refetch();
      },
    }),
    [
      session,
      sessionHydrated,
      mpinUnlocked,
      userInfoQuery.data,
      userInfoQuery.isLoading,
      userInfoQuery.error,
      userInfoQuery.refetch,
      setSession,
      updateSessionTokens,
      completeMpin,
      signOut,
    ],
  );

  return (
    <UserAuthContext.Provider value={value}>{children}</UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error('useUserAuth must be used within UserAuthProvider');
  }
  return context;
}
