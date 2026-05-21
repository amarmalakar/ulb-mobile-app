import { AUTH_TYPE_STORAGE_KEY, setAuthTypeHeaderValue } from '@/lib/auth-type-storage';
import type { AuthType } from '@/types/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

function parseAuthType(stored: string | null): AuthType {
  if (stored === 'Staff' || stored === 'User') {
    return stored;
  }
  return null;
}

export function useAuthType() {
  const [authType, setAuthType] = useState<AuthType>(null);

  const handleAuthType = useCallback(async (authType: AuthType) => {
    try {
      await AsyncStorage.setItem(AUTH_TYPE_STORAGE_KEY, authType ?? "");
      setAuthTypeHeaderValue(authType);
    } catch (error) {
      console.error(error);
    }
    setAuthType(authType);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadAuthType() {
      try {
        const stored = await AsyncStorage.getItem(AUTH_TYPE_STORAGE_KEY);
        const parsed = parseAuthType(stored);
        if (mounted) {
          setAuthTypeHeaderValue(parsed);
          setAuthType(parsed);
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