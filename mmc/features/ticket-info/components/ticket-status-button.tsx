import * as React from "react";
import { Platform, Pressable, ScrollView, View, type LayoutChangeEvent } from "react-native";
import { CheckIcon } from "lucide-react-native";
import {
  getAllowedTicketStatusTransitions,
  type iTicketStatus,
  type TicketStatusActor,
} from "@/features/tickets/types";

import { Icon } from "@/components/ui/icon";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { getTicketStatusConfig } from "@/features/tickets/utils";
import { useAuthContext } from "@/components/provider/auth-provider";
import { useTranslation } from "react-i18next";

const DROPDOWN_SHADOW =
  Platform.OS === "ios"
    ? {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
    }
    : { elevation: 6 };

export type TicketStatusButtonProps = {
  status: iTicketStatus | undefined;
  onStatusChange?: (status: iTicketStatus) => void;
  disabled?: boolean;
};

export default function TicketStatusButton({
  status,
  onStatusChange,
  disabled = false
}: TicketStatusButtonProps) {
  const { t } = useTranslation();
  const { authType } = useAuthContext();
  const [open, setOpen] = React.useState(false);
  const [minWidth, setMinWidth] = React.useState(160);

  if (!status) {
    return (
      <View className="h-10 w-[140px] items-center justify-center rounded-md border border-border bg-muted/40">
        <Typography className="text-muted-foreground text-sm">{t("common.ellipsis")}</Typography>
      </View>
    );
  }

  const statusConfig = getTicketStatusConfig(status);

  const onTriggerLayout = (e: LayoutChangeEvent) => {
    setMinWidth(Math.max(e.nativeEvent.layout.width, 140));
  };


  const actor: TicketStatusActor = authType === "Staff" ? "STAFF" : "USER";
  const statuses = getAllowedTicketStatusTransitions(actor, status);
  const canOpen = Boolean(onStatusChange) && !disabled && statuses.length > 0;

  return (
    <View className="relative z-[100] self-start" collapsable={false}>
      <Pressable
        onLayout={onTriggerLayout}
        onPress={() => {
          if (!canOpen || statuses.length === 0) return;
          setOpen((v) => !v);
        }}
        disabled={!canOpen}
        className={cn(
          "mt-2 h-auto w-auto rounded-sm border-0 px-2 py-1 shadow-none",
          statusConfig.badge.bgClassName,
          "flex-row items-center justify-between gap-2",
          (!canOpen || disabled) && "opacity-60",
        )}
      >
        <Icon as={statusConfig.icon} className={cn("size-4 shrink-0", statusConfig.iconClassName)} />
        <Typography
          className={cn("text-sm font-semibold", statusConfig.badge.textClassName)}
          numberOfLines={1}
        >
          {statusConfig.label}
        </Typography>
      </Pressable>

      {open && canOpen ? (
        <View
          className="absolute right-0 top-full z-[101] mt-1 max-h-72 overflow-hidden rounded-md border border-border bg-popover"
          style={[{ minWidth }, DROPDOWN_SHADOW]}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {statuses.map((s) => {
              const cfg = getTicketStatusConfig(s as iTicketStatus);
              const selected = s === status;
              return (
                <Pressable
                  key={s}
                  onPress={() => {
                    if (onStatusChange && s !== status) {
                      onStatusChange(s as iTicketStatus);
                    }
                    setOpen(false);
                  }}
                  className={cn(
                    "min-h-11 flex-row items-center justify-between gap-2 border-b border-border px-3 py-2.5 last:border-b-0",
                    "active:bg-muted/70",
                    selected && "bg-muted/40",
                  )}
                >
                  <Icon as={cfg.icon} className={cn("size-4 shrink-0", cfg.iconClassName)} />
                  <Typography
                    className={cn(
                      "flex-1 text-sm",
                      selected ? cn("font-semibold", cfg.titleClassName) : "text-foreground",
                    )}
                    numberOfLines={1}
                  >
                    {cfg.label}
                  </Typography>
                  {selected ? (
                    <Icon as={CheckIcon} className={cn("size-4 shrink-0", cfg.iconClassName)} />
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}
