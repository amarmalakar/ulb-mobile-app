import { useEffect } from 'react';

import { useAuthContext } from '@/components/provider/auth-provider';
import { isApiError } from '@/lib/api-client';
import { isInvalidAuthSessionError } from '@/lib/unauthorized-session';

/** Log out the active role (Staff or User) and return to Get Started. */
export function useLogout() {
  const { logout, isLoggingOut, authType } = useAuthContext();
  return { logout, isLoggingOut, authType };
}

/** Auto-logout and return to Get Started when the session or account is no longer valid. */
export function useSessionExpiredLogout(error: unknown) {
  const { logout } = useLogout();
  const isExpired = isApiError(error) && isInvalidAuthSessionError(error);

  useEffect(() => {
    if (!isExpired) return;
    void logout();
  }, [isExpired, logout]);

  return isExpired;
}
