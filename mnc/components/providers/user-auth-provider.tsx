import { useNetworkContext } from '@/components/providers/network-provider';
import {
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
import { loadAuthTypeFromStorage } from '@/lib/auth-type-storage';
import { API_PATHS } from '@/lib/api-paths';
import {
  clearUserSession,
  loadUserSession,
  persistUserSession,
} from '@/lib/user-auth-storage';
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
  userInfo: UserInfo | undefined;
  isUserInfoLoading: boolean;
  userInfoError: Error | null;
  setSession: (session: UserAuthSession | null) => Promise<void>;
  updateSessionTokens: (tokens: {
    accessToken: string;
    refreshToken?: string;
  }) => Promise<UserAuthSession | null>;
  signOut: () => Promise<void>;
  refetchUserInfo: () => void;
};

const UserAuthContext = createContext<UserAuthContextValue | undefined>(undefined);

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const { client, queryClient } = useNetworkContext();
  const logoutMutation = useUserLogoutMutation();
  const [session, setSessionState] = useState<UserAuthSession | null>(null);
  const [sessionHydrated, setSessionHydrated] = useState(false);
  const [activeForUser, setActiveForUser] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const authType = await loadAuthTypeFromStorage();
        const isUser = authType === 'User';
        if (!cancelled) {
          setActiveForUser(isUser);
        }

        if (!isUser) {
          if (!cancelled) setSessionState(null);
          return;
        }

        const stored = await loadUserSession();
        if (!stored) {
          if (!cancelled) setSessionState(null);
          return;
        }

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
            await clearUserSession();
            if (!cancelled) setSessionState(null);
          } else {
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
        setActiveForUser(true);
        await persistUserSession(next);
        setSessionState(next);
      } else {
        setActiveForUser(false);
        await clearUserSession();
        setSessionState(null);
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
    const refreshToken = session?.refreshToken ?? (await loadUserSession())?.refreshToken;
    if (refreshToken) {
      try {
        await logoutMutation.mutateAsync({ refreshToken });
      } catch {
        // Clear local session even if logout API fails
      }
    }
    await setSession(null);
  }, [logoutMutation, session?.refreshToken, setSession]);

  const userInfoQuery = useUserInfoQuery(
    activeForUser ? session?.accessToken : null,
  );

  const value = useMemo<UserAuthContextValue>(
    () => ({
      session,
      sessionHydrated,
      userInfo: userInfoQuery.data,
      isUserInfoLoading: userInfoQuery.isLoading,
      userInfoError: userInfoQuery.error,
      setSession,
      updateSessionTokens,
      signOut,
      refetchUserInfo: () => {
        void userInfoQuery.refetch();
      },
    }),
    [
      session,
      sessionHydrated,
      userInfoQuery.data,
      userInfoQuery.isLoading,
      userInfoQuery.error,
      userInfoQuery.refetch,
      setSession,
      updateSessionTokens,
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
