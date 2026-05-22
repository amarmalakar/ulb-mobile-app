import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";

import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";

import { ArrowLeftIcon, MenuIcon } from "lucide-react-native";

import { useAuthContext } from "@/components/provider/auth-provider";
import { useStaffAuth } from "@/components/provider/staff-auth-provider";
import { useUserAuth } from "@/components/provider/user-auth-provider";
import { useLogout } from "@/hooks/use-logout";
import { MobileMenu } from "./mobile-menu";

export function TopNavigation({
  label,
  isBackButton = true
}: {
  label: string;
  isBackButton?: boolean;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const { logout, isLoggingOut } = useLogout();
  const { authType } = useAuthContext();
  const { staffInfo } = useStaffAuth();
  const { userInfo } = useUserAuth();

  const userName = useMemo(() => {
    if (authType === "Staff") {
      return staffInfo?.name ?? t("common.staff");
    }
    if (authType === "User") {
      return userInfo?.name ?? t("common.user");
    }
    return t("common.guest");
  }, [authType, staffInfo?.name, userInfo?.name, t]);

  return (
    <>
      <View className="border-b border-primary/75 px-4 pb-3 pt-12 bg-primary/20">
        <View className="flex flex-row items-center justify-between">
          <View className="flex flex-row items-center gap-4">
            {isBackButton ? (
              <Pressable
                onPress={() => router.back()}
                className="w-10 h-10 items-center justify-center rounded-full bg-primary/10 shadow-lg"
              >
                <ArrowLeftIcon size={20} color="#4FC3C9" />
              </Pressable>
            ) : null}
            <Text className="text-lg font-semibold text-primary">
              {label}
            </Text>
          </View>

          <Pressable
            onPress={() => setIsMenuVisible(true)}
            disabled={isLoggingOut}
          >
            <Icon as={MenuIcon} className="text-primary" size={18} />
          </Pressable>
        </View>
      </View>

      {isMenuVisible ? (
        <MobileMenu
          visible={isMenuVisible}
          userName={userName}
          onClose={() => setIsMenuVisible(false)}
          onLogout={() => {
            setIsMenuVisible(false);
            void logout();
          }}
        />
      ) : null}
    </>
  )
}