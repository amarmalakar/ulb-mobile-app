import { createContext, useContext, useMemo } from "react";
import { useUserType } from "@/hooks/use-user-type";

export type iUserTypes = "Staff" | "User" | null;
interface iAuthContext {
  userType: iUserTypes;
  handleUserType: (userType: iUserTypes) => void;
}

const AuthContext = createContext<iAuthContext | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { userType, handleUserType } = useUserType();

  const value = useMemo(() => ({
    userType,
    handleUserType
  }), [
    userType,
    handleUserType,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}