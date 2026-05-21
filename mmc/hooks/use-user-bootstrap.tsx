import { useUserAuth } from '@/components/provider/user-auth-provider';
import { useAuthType } from '@/hooks/use-auth-type';
import { type Href, usePathname, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

const USER_HOME_HREF = '/user/home-screen' as Href;
const USER_MPIN_HREF = '/user-auth/user-mpin-screen' as Href;
const USER_LOGIN_HREF = '/user-auth/user-login-screen' as Href;

/** On cold start, resume user flow when auth type and session are already stored. */
export function useUserBootstrap() {
  const router = useRouter();
  const pathname = usePathname();
  const { authType } = useAuthType();
  const { session, sessionHydrated, mpinUnlocked } = useUserAuth();
  const didRedirect = useRef(false);

  useEffect(() => {
    if (didRedirect.current) return;
    if (authType !== 'User' || !sessionHydrated) return;
    if (pathname !== '/') return;

    didRedirect.current = true;

    if (!session?.refreshToken) {
      router.replace(USER_LOGIN_HREF);
      return;
    }

    if (mpinUnlocked) {
      router.replace(USER_HOME_HREF);
    } else {
      router.replace(USER_MPIN_HREF);
    }
  }, [authType, session, sessionHydrated, mpinUnlocked, router, pathname]);
}
