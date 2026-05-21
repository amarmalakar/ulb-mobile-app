import { useAuthContext } from '@/components/provider/auth-provider';

/** Log out the active role (Staff or User) and return to Get Started. */
export function useLogout() {
  const { logout, isLoggingOut, authType } = useAuthContext();
  return { logout, isLoggingOut, authType };
}
