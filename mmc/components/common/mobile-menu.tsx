import { useAppInitContext } from "@/components/provider/app-init-provider";
import { useRouter } from "expo-router";
import { View, Text, Modal, Pressable } from "react-native";
import { BellIcon, CircleHelpIcon, LogOutIcon, MessageSquareTextIcon, SettingsIcon, UserRoundIcon, XIcon } from "lucide-react-native";
import { useAuthContext } from "../provider/auth-provider";

function generateStaffMenuItems(router: ReturnType<typeof useRouter>) {
  return [
    { label: "Profile", icon: UserRoundIcon, onPress: () => { } },
    { label: "Notifications", icon: BellIcon, onPress: () => { } },
    { label: "Settings", icon: SettingsIcon, onPress: () => { } },
    { label: "Feedback & Suggestion", icon: MessageSquareTextIcon, onPress: () => { router.push('/common/feedback-and-suggestion-screen') } },
    { label: "Help & Support", icon: CircleHelpIcon, onPress: () => { } },
  ]
}

function generateUserMenuItems(router: ReturnType<typeof useRouter>) {
  return [
    { label: "Profile", icon: UserRoundIcon, onPress: () => { } },
    { label: "Notifications", icon: BellIcon, onPress: () => { } },
    { label: "Settings", icon: SettingsIcon, onPress: () => { } },
    { label: "Feedback & Suggestion", icon: MessageSquareTextIcon, onPress: () => { router.push('/common/feedback-and-suggestion-screen') } },
    { label: "Help & Support", icon: CircleHelpIcon, onPress: () => { } },
  ]
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
    <Pressable onPress={onPress} className="bg-muted mt-2 flex-row items-center rounded-xl px-3 py-3">
      <Icon size={18} color="#737373" />
      <Text className="text-foreground ml-2 text-base font-medium">{label}</Text>
    </Pressable>
  );
}

export function MobileMenu({
  visible,
  userName,
  onClose,
  onLogout,
}: MobileMenuProps) {
  const router = useRouter();
  const { authType } = useAuthContext();

  const menuItems = authType === 'Staff' ? generateStaffMenuItems(router) : generateUserMenuItems(router);

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View className="flex-1 flex-row justify-end bg-black/30">
        <Pressable className="flex-1" onPress={onClose} />
        <View className="bg-card h-full w-[78%] px-4 pb-8 pt-14">
          <View className="flex-row items-center justify-between">
            <Text className="text-foreground text-lg font-bold">Menu</Text>
            <Pressable onPress={onClose} className="bg-muted h-9 w-9 items-center justify-center rounded-full">
              <XIcon size={18} color="#737373" />
            </Pressable>
          </View>

          <View className="bg-muted mt-5 rounded-2xl px-4 py-4">
            <Text className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
              Logged in as {authType}
            </Text>
            <Text className="text-foreground mt-1 text-lg font-bold">{userName}</Text>
          </View>

          <View className="mt-4">
            {menuItems.map((item) => (
              <MenuItem key={item.label} label={item.label} icon={item.icon} onPress={() => {
                onClose();
                item.onPress?.();
              }} />
            ))}
          </View>

          <Pressable onPress={onLogout} className="bg-destructive mt-auto flex-row items-center justify-center rounded-xl py-3">
            <LogOutIcon size={18} color="#FFFFFF" />
            <Text className="text-white ml-2 text-base font-semibold">Logout</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}