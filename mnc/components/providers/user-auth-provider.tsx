import { useNetworkContext } from '@/components/providers/network-provider';
import {
  fetchUserInfo,
  useUserInfoQuery,
  useUserLogoutMutation,
} from '@/features/user-auth/hooks/use-user-auth-queries';
import { userQueryKeys } from '@/features/user-auth/query-keys';
import type {
  UserAuthSession,
  UserInfo,
  UserSessionRefreshData,
} from '@/features/user-auth/types/index';
import { throwUnlessOk } from '@/features/user-auth/utils/api-response';
import { isApiError } from '@/lib/api-client';
import { API_PATHS } from '@/lib/api-paths';
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
        if (!stored) {
          if (!cancelled) setSessionState(null);
          return;
        }

        // The stored access token is typically expired after the app was
        // killed or backgrounded for a while. Rotate it once during hydration
        // so the first authenticated call (e.g. /user/auth/mpin/status) does
        // not hit the server with a stale token and get a 401.
        try {
          const res = (await client.post(API_PATHS.user.sessionRefresh, {
            refreshToken: stored.refreshToken,
          })) as { ok?: boolean; data?: UserSessionRefreshData; message?: string };
          const data = throwUnlessOk(res, 'Session refresh failed');
          const next: UserAuthSession = {
            ...stored,
            accessToken: data.accessToken,
          };
          await persistUserSession(next);
          if (!cancelled) setSessionState(next);
        } catch (refreshError) {
          if (isApiError(refreshError) && refreshError.status === 401) {
            // Refresh token has been revoked/expired server-side — drop the
            // session so the user is routed back to login.
            await clearUserSession();
            if (!cancelled) setSessionState(null);
          } else {
            // Network or other transient failure — keep the stored session so
            // the user can retry once connectivity is restored.
            if (!cancelled) setSessionState(stored);
          }
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
  }, [client]);

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
