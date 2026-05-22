import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { type Href, useRouter } from 'expo-router';

import { useStaffAuth } from '@/components/provider/staff-auth-provider';
import { useUserAuth } from '@/components/provider/user-auth-provider';
import { useAuthType } from '@/hooks/use-auth-type';
import { useTranslation } from 'react-i18next';
import type { AuthType } from '@/types/auth';

const STAFF_HOME_HREF = '/staff/home-screen' as Href;
const STAFF_MPIN_HREF = '/staff-auth/staff-mpin-screen' as Href;
const STAFF_LOGIN_HREF = '/staff-auth/staff-login-screen' as Href;

const USER_HOME_HREF = '/user/home-screen' as Href;
const USER_MPIN_HREF = '/user-auth/user-mpin-screen' as Href;
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
  const { authType, handleAuthType } = useAuthType();
  const { signOut: staffSignOut, session, sessionHydrated, mpinUnlocked } = useStaffAuth();
  const {
    signOut: userSignOut,
    session: userSession,
    sessionHydrated: userSessionHydrated,
    mpinUnlocked: userMpinUnlocked,
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
      if (mpinUnlocked) {
        router.replace(STAFF_HOME_HREF);
      } else {
        router.replace(STAFF_MPIN_HREF);
      }
      return;
    }

    router.push(STAFF_LOGIN_HREF);
  }, [handleAuthType, router, session, sessionHydrated, mpinUnlocked]);

  const startAsUser = useCallback(async () => {
    await handleAuthType('User');

    if (userSessionHydrated && userSession?.refreshToken) {
      if (userMpinUnlocked) {
        router.replace(USER_HOME_HREF);
      } else {
        router.replace(USER_MPIN_HREF);
      }
      return;
    }

    router.push(USER_LOGIN_HREF);
  }, [
    handleAuthType,
    router,
    userSession,
    userSessionHydrated,
    userMpinUnlocked,
  ]);

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
    router,
    staffSignOut,
    userSignOut,
  ]);

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
