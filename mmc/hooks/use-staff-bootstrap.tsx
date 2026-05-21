import { useStaffAuth } from '@/components/provider/staff-auth-provider';
import { useAuthType } from '@/hooks/use-auth-type';
import { type Href, usePathname, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

const STAFF_HOME_HREF = '/staff/home-screen' as Href;
const STAFF_MPIN_HREF = '/staff-auth/staff-mpin-screen' as Href;
const STAFF_LOGIN_HREF = '/staff-auth/staff-login-screen' as Href;

/**
 * On cold start, resume staff flow when auth type and session are already stored.
 */
export function useStaffBootstrap() {
  const router = useRouter();
  const pathname = usePathname();
  const { authType } = useAuthType();
  const { session, sessionHydrated, mpinUnlocked } = useStaffAuth();
  const didRedirect = useRef(false);

  useEffect(() => {
    if (didRedirect.current) return;
    if (authType !== 'Staff' || !sessionHydrated) return;
    if (pathname !== '/') return;

    didRedirect.current = true;

    if (!session?.accessToken) {
      router.replace(STAFF_LOGIN_HREF);
      return;
    }

    if (mpinUnlocked) {
      router.replace(STAFF_HOME_HREF);
    } else {
      router.replace(STAFF_MPIN_HREF);
    }
  }, [authType, session, sessionHydrated, mpinUnlocked, router, pathname]);
}
