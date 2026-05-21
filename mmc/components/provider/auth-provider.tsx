import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useAuthType } from "@/hooks/use-auth-type";
import { useRouter } from "expo-router";

export type iAuthTypes = "Staff" | "User" | null;
interface iAuthContext {
  authType: iAuthTypes;
  handleAuthType: (authType: iAuthTypes) => void;
  currentStep: { title: string; onPress: () => void }[];
}

const AuthContext = createContext<iAuthContext | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { authType, handleAuthType } = useAuthType();
  const [step, setStep] = useState<1 | 2>(1);


  const handleNextStep = useCallback((stepParam: 1 | 2) => {
    setStep(stepParam);
  }, []);

  const startAsStaff = useCallback(async () => {
    await handleAuthType("Staff");
  }, []);

  const startAsUser = useCallback(async () => {
    await handleAuthType("User");
  }, []);

  const GET_STARTED_STEPS = useMemo(
    () => ({
      1: [
        {
          title: "Get Started",
          onPress: () => handleNextStep(2),
        },
      ],
      2: [
        {
          title: "Start as Staff",
          onPress: () => {
            void startAsStaff();
          },
        },
        {
          title: "Start as User",
          onPress: () => {
            void startAsUser();
          },
        },
      ],
    }),
    [handleNextStep, handleAuthType, router, startAsStaff, startAsUser],
  );

  const currentStep = useMemo(() => GET_STARTED_STEPS[step], [step]);

  const value = useMemo(() => ({
    authType,
    handleAuthType,
    currentStep
  }), [
    authType,
    handleAuthType,
    currentStep
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