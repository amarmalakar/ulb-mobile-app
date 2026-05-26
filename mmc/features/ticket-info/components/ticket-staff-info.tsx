import { View, Linking, Pressable } from "react-native";
import type { UserTicketAssignedStaff } from "@/features/tickets/types";
import { PhoneCallIcon } from "lucide-react-native";

import { useTranslation } from "react-i18next";
import { Typography } from "@/components/ui/typography";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function TicketStaffInfo({ staff }: {
  staff: UserTicketAssignedStaff | null;
}) {
  const { t } = useTranslation();

  if (!staff) {
    return (
      <View className="rounded-xl bg-card">
        <Typography className="text-sm text-muted-foreground">
          {t("tickets.noStaffAssigned")}
        </Typography>
      </View>
    )
  }

  const handleCallNow = () => {
    const sanitizedPhone = staff.phoneNumber.replace(/\s+/g, "");
    Linking.openURL(`tel:${sanitizedPhone}`);
  };

  return (
    <View className="gap-4">
      <View className="flex-row items-center gap-3 rounded-xl bg-card p-4">
        <Avatar alt={`${staff.name} avatar`}>
          {staff.imgProfileUrl ? (
            <AvatarImage src={staff.imgProfileUrl} />
          ) : null}
          <AvatarFallback>
            <Typography className="text-sm font-semibold text-foreground">{initials(staff.name)}</Typography>
          </AvatarFallback>
        </Avatar>
        <View className="flex-1">
          <Typography className="text-lg font-semibold text-foreground">{staff.name}</Typography>
          <Typography className="text-sm text-muted-foreground">{staff.staffPosition.name}</Typography>
        </View>
      </View>

      <View className="gap-3 rounded-xl bg-card p-4">
        <View className="gap-1">
          <Typography className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("account.phone")}
          </Typography>
          <View className="flex-row items-center justify-between">
            <Typography className="text-base text-foreground">{staff.phoneNumber}</Typography>
            <Pressable
              onPress={handleCallNow}
              className="flex-row items-center gap-1.5 rounded-md bg-primary px-3 py-1.5"
            >
              <PhoneCallIcon size={14} color="white" />
              <Typography className="text-xs font-semibold text-primary-foreground">{t("common.callNow")}</Typography>
            </Pressable>
          </View>
        </View>

        <View className="gap-1">
          <Typography className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("account.email")}
          </Typography>
          <Typography className="text-base text-foreground">{staff.email}</Typography>
        </View>

        <View className="gap-1">
          <Typography className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Address
          </Typography>
          <Typography className="text-base text-foreground">{staff.address ?? "—"}</Typography>
        </View>
      </View>
    </View>
  );
}