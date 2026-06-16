import {
  AUTH_TYPE_STORAGE_KEY,
  loadAuthTypeFromStorage,
  parseAuthType,
  setAuthTypeHeaderValue,
} from '@/lib/auth-type-storage';
import { loadUserSession } from '@/lib/user-auth-storage';
import type { AuthType } from '@/types/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export { parseAuthType };

export function useAuthType() {
  const [authType, setAuthType] = useState<AuthType>(null);

  const handleAuthType = useCallback(async (next: AuthType) => {
    try {
      await AsyncStorage.setItem(AUTH_TYPE_STORAGE_KEY, next ?? '');
      setAuthTypeHeaderValue(next);
    } catch (error) {
      console.error(error);
    }
    setAuthType(next);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadAuthType() {
      try {
        const parsed = await loadAuthTypeFromStorage();
        if (mounted) {
          setAuthTypeHeaderValue(parsed);
          setAuthType(parsed);
          if (parsed === 'User') {
            await loadUserSession();
          }
        }
      } catch (error) {
        console.error(error);
      }
    }

    void loadAuthType();

    return () => {
      mounted = false;
    };
  }, []);

  return { authType, handleAuthType };
}
