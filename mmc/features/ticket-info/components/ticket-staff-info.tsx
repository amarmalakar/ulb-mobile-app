import { View, Linking, Pressable } from "react-native";
import type { UserTicketAssignedStaff } from "@/features/tickets/types";
import { PhoneCallIcon } from "lucide-react-native";

import { Text } from "@/components/ui/text";
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
  if (!staff) {
    return (
      <View className="rounded-xl bg-card">
        <Text className="text-sm text-muted-foreground">
          No staff has been assigned to this ticket yet.
        </Text>
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
            <Text className="text-sm font-semibold text-foreground">{initials(staff.name)}</Text>
          </AvatarFallback>
        </Avatar>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-foreground">{staff.name}</Text>
          <Text className="text-sm text-muted-foreground">{staff.staffPosition.name}</Text>
        </View>
      </View>

      <View className="gap-3 rounded-xl bg-card p-4">
        <View className="gap-1">
          <Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Phone
          </Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-base text-foreground">{staff.phoneNumber}</Text>
            <Pressable
              onPress={handleCallNow}
              className="flex-row items-center gap-1.5 rounded-md bg-primary px-3 py-1.5"
            >
              <PhoneCallIcon size={14} color="white" />
              <Text className="text-xs font-semibold text-primary-foreground">Call Now</Text>
            </Pressable>
          </View>
        </View>

        <View className="gap-1">
          <Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Email
          </Text>
          <Text className="text-base text-foreground">{staff.email}</Text>
        </View>

        <View className="gap-1">
          <Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Address
          </Text>
          <Text className="text-base text-foreground">{staff.address ?? "—"}</Text>
        </View>
      </View>
    </View>
  );
}