import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { View, Modal, Pressable, ScrollView } from "react-native";
import { BellIcon, CircleHelpIcon, LogOutIcon, MessageSquareTextIcon, SchoolIcon, UserRoundIcon, XIcon } from "lucide-react-native";
import { Typography } from "@/components/common/typography";
import { useAuthContext } from "@/components/providers/auth-provider";
import type { AuthType } from "@/types/auth";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function generateMenuItems(
  router: ReturnType<typeof useRouter>,
  t: TFunction,
  authType: AuthType,
) {
  const items = [
    {
      label: t("menu.profile"),
      icon: UserRoundIcon,
      onPress: () => {
        if (authType === "User") {
          router.push('/user/user-account-screen' as never);
        } else if (authType === "Staff") {
          router.push('/staff/staff-account-screen' as never);
        }
      },
    },
    { label: t("menu.notifications"), icon: BellIcon, onPress: () => { } },
    ...(authType === "User"
      ? [
        {
          label: t('bookings.yourBookings'),
          icon: SchoolIcon,
          onPress: () => { router.push('/user/user-your-booking-screen' as never) },
        },
      ]
      : []),
    {
      label: t("menu.feedback"),
      icon: MessageSquareTextIcon,
      onPress: () => { router.push('/common/feedback-and-suggestion-screen') },
    },
    { label: t("menu.help"), icon: CircleHelpIcon, onPress: () => { } },
  ];

  return items;
}

type MobileMenuProps = {
  visible: boolean;
  userName: string;
  onClose: () => void;
  onLogout: () => void;
}

type MenuItemProps = {
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  onPress?: () => void;
};

function MenuItem({ label, icon: Icon, onPress }: MenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-muted mt-2 flex-row items-center rounded-xl px-3 py-3 active:opacity-80"
      hitSlop={6}
    >
      <Icon size={18} color="#737373" />
      <Typography weight="medium" className="text-foreground ml-2 text-base">{label}</Typography>
    </Pressable>
  );
}

export function MobileMenu({
  visible,
  userName,
  onClose,
  onLogout,
}: MobileMenuProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { authType } = useAuthContext();
  const insets = useSafeAreaInsets();

  const menuItems = generateMenuItems(router, t, authType);
  const roleKey =
    authType === "Staff" ? "common.staff" : authType === "User" ? "common.user" : "common.guest";

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View className="flex-1 flex-row justify-end bg-black/30">
        <Pressable className="flex-1" onPress={onClose} />
        <View
          className="bg-card h-full w-[82%] rounded-l-3xl px-4"
          style={{ paddingTop: 24, paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <View className="flex-row items-center justify-between">
            <Typography weight="bold" className="text-foreground text-lg">{t("menu.title")}</Typography>
            <Pressable onPress={onClose} className="bg-muted h-9 w-9 items-center justify-center rounded-full">
              <XIcon size={18} color="#737373" />
            </Pressable>
          </View>

          <ScrollView
            className="mt-5 flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-4"
            keyboardShouldPersistTaps="handled"
          >
            <View className="bg-muted rounded-2xl px-4 py-4">
              <Typography variant="overline" weight="semibold" className="text-muted-foreground">
                {t("menu.loggedInAs", { role: t(roleKey) })}
              </Typography>
              <Typography weight="bold" className="text-foreground mt-1 text-lg">{userName}</Typography>
            </View>

            <View className="mt-4">
              {menuItems.map((item) => (
                <MenuItem key={item.label} label={item.label} icon={item.icon} onPress={() => {
                  onClose();
                  item.onPress?.();
                }} />
              ))}
            </View>
          </ScrollView>

          <Pressable onPress={onLogout} className="bg-destructive mt-2 flex-row items-center justify-center rounded-xl py-3">
            <LogOutIcon size={18} color="#FFFFFF" />
            <Typography weight="semibold" className="text-white ml-2 text-base">{t("menu.logout")}</Typography>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}