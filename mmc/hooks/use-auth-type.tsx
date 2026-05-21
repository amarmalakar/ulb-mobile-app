import { iAuthTypes } from "@/components/provider/auth-provider";
import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useAuthType() {
  const [authType, setAuthType] = useState<iAuthTypes>(null);

  const handleAuthType = useCallback(async (authType: iAuthTypes) => {
    try {
      await AsyncStorage.setItem("auth-type", authType ?? "");
    } catch (error) {
      console.error(error);
    }
    setAuthType(authType);
  }, []);

  const getAuthType = async () => {
    try {
      const authType = await AsyncStorage.getItem("auth-type");
      setAuthType(authType as iAuthTypes);
    } catch (error) {
      console.error(error);
    } finally { }
  };

  useEffect(() => {
    getAuthType();
  }, []);

  return { authType, handleAuthType };
}