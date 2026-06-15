import { Linking, Pressable, View } from "react-native";
import { PhoneCallIcon } from "lucide-react-native";

import type { UserTicketDetailUser } from "@/features/tickets/types";

import { useTranslation } from "react-i18next";
import { Typography } from "@/components/common/typography";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function TicketUserInfo({ user }: { user: UserTicketDetailUser }) {
  const { t } = useTranslation();

  const handleCallNow = () => {
    const sanitizedPhone = user.phone.replace(/\s+/g, "");
    Linking.openURL(`tel:${sanitizedPhone}`);
  };

  return (
    <View className="gap-4">
      <View className="flex-row items-center gap-3 rounded-xl bg-card p-4">
        <Avatar alt={`${user.name} avatar`}>
          <AvatarFallback>
            <Typography className="text-sm font-semibold text-foreground">{initials(user.name)}</Typography>
          </AvatarFallback>
        </Avatar>
        <View className="flex-1">
          <Typography className="text-lg font-semibold text-foreground">{user.name}</Typography>
          <Typography className="text-sm text-muted-foreground">{t("common.citizen")}</Typography>
        </View>
      </View>

      <View className="gap-3 rounded-xl bg-card p-4">
        <View className="gap-1">
          <Typography className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("account.phone")}
          </Typography>
          <View className="flex-row items-center justify-between">
            <Typography className="text-base text-foreground">{user.phone}</Typography>
            <Pressable
              onPress={handleCallNow}
              className="flex-row items-center gap-1.5 rounded-md bg-primary px-3 py-1.5"
            >
              <PhoneCallIcon size={14} color="white" />
              <Typography className="text-xs font-semibold text-primary-foreground">{t("common.callNow")}</Typography>
            </Pressable>
          </View>
        </View>

        {user.email ? (
          <View className="gap-1">
            <Typography className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("account.email")}
            </Typography>
            <Typography className="text-base text-foreground">{user.email}</Typography>
          </View>
        ) : null}
      </View>
    </View>
  );
}
