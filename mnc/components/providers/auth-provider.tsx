import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { type Href, useRouter } from 'expo-router';

import { useStaffAuth } from '@/components/providers/staff-auth-provider';
import { useUserAuth } from '@/components/providers/user-auth-provider';
import { useNetworkContext } from '@/components/providers/network-provider';
import { useAuthType } from '@/hooks/use-auth-type';
import { setUnauthorizedSessionHandler } from '@/lib/unauthorized-session';
import { useTranslation } from 'react-i18next';
import type { AuthType } from '@/types/auth';

const STAFF_HOME_HREF = '/staff/home-screen' as Href;
const STAFF_LOGIN_HREF = '/staff-auth/staff-login-screen' as Href;

const USER_HOME_HREF = '/user/home-screen' as Href;
const USER_LOGIN_HREF = '/user-auth/user-login-screen' as Href;
/** @deprecated Use `AuthType` from `@/types/auth` */
export type iAuthTypes = AuthType;

interface iAuthContext {
  authType: AuthType;
  handleAuthType: (authType: AuthType) => Promise<void>;
  clearAuthType: () => void;
  logout: () => Promise<void>;
  isLoggingOut: boolean;
  currentStep: { title: string; onPress: () => void }[];
}

const AuthContext = createContext<iAuthContext | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { queryClient } = useNetworkContext();
  const { authType, handleAuthType } = useAuthType();
  const {
    signOut: staffSignOut,
    setSession: setStaffSession,
    session,
    sessionHydrated,
  } = useStaffAuth();
  const {
    signOut: userSignOut,
    setSession: setUserSession,
    session: userSession,
    sessionHydrated: userSessionHydrated,
  } = useUserAuth();
  const { i18n } = useTranslation();
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleNextStep = useCallback((stepParam: 1 | 2) => {
    setStep(stepParam);
  }, []);

  const clearAuthType = useCallback(() => {
    void (async () => {
      await handleAuthType(null);
      setStep(1);
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    })();
  }, [handleAuthType, router]);

  const startAsStaff = useCallback(async () => {
    await handleAuthType('Staff');

    if (sessionHydrated && session?.accessToken) {
      router.replace(STAFF_HOME_HREF);
      return;
    }

    router.push(STAFF_LOGIN_HREF);
  }, [handleAuthType, router, session, sessionHydrated]);

  const startAsUser = useCallback(async () => {
    await handleAuthType('User');

    if (userSessionHydrated && userSession?.refreshToken) {
      router.replace(USER_HOME_HREF);
      return;
    }

    router.push(USER_LOGIN_HREF);
  }, [handleAuthType, router, userSession, userSessionHydrated]);

  const GET_STARTED_STEPS = useMemo(
    () => ({
      1: [
        {
          title: i18n.t('welcome.getStarted'),
          onPress: () => handleNextStep(2),
        },
      ],
      2: [
        {
          title: i18n.t('welcome.startAsStaff'),
          onPress: () => {
            void startAsStaff();
          },
        },
        {
          title: i18n.t('welcome.startAsUser'),
          onPress: () => {
            void startAsUser();
          },
        },
      ],
    }),
    [handleNextStep, startAsStaff, startAsUser, i18n.language],
  );

  const currentStep = useMemo(() => GET_STARTED_STEPS[step], [step, GET_STARTED_STEPS]);

  const logout = useCallback(async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      if (authType === 'Staff') {
        await staffSignOut();
      } else if (authType === 'User') {
        await userSignOut();
      }

      await Promise.all([setStaffSession(null), setUserSession(null)]);
      queryClient.clear();
      await handleAuthType(null);
      setStep(1);
      router.replace('/');
    } finally {
      setIsLoggingOut(false);
    }
  }, [
    authType,
    handleAuthType,
    isLoggingOut,
    queryClient,
    router,
    setStaffSession,
    setUserSession,
    staffSignOut,
    userSignOut,
  ]);

  const handleSessionExpired = useCallback(async () => {
    await logout();
  }, [logout]);

  useEffect(() => {
    setUnauthorizedSessionHandler(() => handleSessionExpired());
    return () => setUnauthorizedSessionHandler(null);
  }, [handleSessionExpired]);

  const value = useMemo(
    () => ({
      authType,
      handleAuthType,
      clearAuthType,
      logout,
      isLoggingOut,
      currentStep,
    }),
    [authType, handleAuthType, clearAuthType, logout, isLoggingOut, currentStep],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
