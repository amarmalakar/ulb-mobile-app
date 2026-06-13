import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

function getIsOnline(state: NetInfoState) {
  if (state.isConnected === false) {
    return false;
  }

  if (state.isInternetReachable === false) {
    return false;
  }

  return true;
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let mounted = true;

    NetInfo.fetch().then((state) => {
      if (mounted) {
        setIsOnline(getIsOnline(state));
      }
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(getIsOnline(state));
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return { isOnline };
}
