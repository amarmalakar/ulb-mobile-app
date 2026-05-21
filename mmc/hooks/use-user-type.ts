import { iUserTypes } from "@/components/provider/auth-provider";
import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useUserType() {
  const [userType, setUserType] = useState<iUserTypes>(null);

  const handleUserType = useCallback(async (userType: iUserTypes) => {
    try {
      await AsyncStorage.setItem("user-type", userType ?? "");
    } catch (error) {
      console.error(error);
    }
    setUserType(userType);
  }, []);

  const getUserType = async () => {
    try {
      const userType = await AsyncStorage.getItem("user-type");
      setUserType(userType as iUserTypes);
    } catch (error) {
      console.error(error);
    } finally { }
  };

  useEffect(() => {
    getUserType();
  }, []);

  return { userType, handleUserType };
}