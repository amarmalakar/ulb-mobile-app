import {
  AlertCircleIcon,
  ClockIcon,
  FileTextIcon,
  HashIcon,
  MapPinIcon,
  StarIcon,
} from "lucide-react-native";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import type { TicketListItem } from "../../tickets/types";
import { useRouter } from "expo-router";

import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/common/typography";
import { Badge } from "@/components/ui/badge";
import { useUserAuth } from "@/components/providers/user-auth-provider";

import { cn } from "@/lib/utils";
import { getLocaleString } from "@/lib/i18n/get-locale-string";
import {
  formatRelativeTime,
  getCategoryIcon,
  getTicketStatusConfig,
} from "@/features/tickets/utils";
import { useAuthContext } from "@/components/providers/auth-provider";

function TicketAvatar({ category }: { category: "SERVICE" | null }) {
  const TicketIcon = getCategoryIcon(category);

  return (
    <View className="size-14 shrink-0 items-center justify-center rounded-full bg-muted">
      <Icon as={TicketIcon} className="text-primary size-6" />
    </View>
  );
}

function TicketCardText({ ticket }: { ticket: TicketListItem }) {
  const { t } = useTranslation();
  const { authType } = useAuthContext();
  const router = useRouter();
  const configs = getTicketStatusConfig(ticket.status);
  const ticketTitle = getLocaleString(ticket.title);
  const serviceTitle = getLocaleString(ticket.complaint.title);

  const metadataLabel = ticket.assignedStaff
    ? t("tickets.assignedToName", { name: ticket.assignedStaff.name })
    : serviceTitle;

  return (
    <View className="flex-1 gap-6">
      <View className="min-w-0 flex-1 justify-center gap-1">
        <View className="flex-row items-center gap-1.5">
          <Icon as={FileTextIcon} className="text-muted-foreground size-4.5 shrink-0" />
          <Typography className="text-muted-foreground shrink text-sm" numberOfLines={1}>
            {metadataLabel}
            {/* {" \u2022 "}
            {formatRelativeTime(ticket.createdAt)} */}
          </Typography>
        </View>
        <View className="flex-row flex-wrap items-center gap-2 my-2">
          <View className="flex-row items-center gap-1 rounded-md bg-sky-100 px-2 py-0.5">
            <Icon as={HashIcon} className="size-3 text-sky-600" />
            <Typography className="text-[13px] font-semibold text-sky-700">
              {t("common.ticketId", { id: ticket.ticketTokenId })}
            </Typography>
          </View>

          <View className="flex-row items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5">
            <Icon as={MapPinIcon} className="size-3 text-emerald-600" />
            <Typography className="text-[13px] font-semibold text-emerald-700">
              {t("common.wardNumber", { ward: ticket.ward })}
            </Typography>
          </View>
        </View>

        <Typography
          className="text-primary text-xl font-bold underline"
          numberOfLines={2}
          onPress={() => router.push({
            pathname: authType === "Staff" ? "/staff/staff-ticket-info-screen" : "/user/user-ticket-info-screen",
            params: {
              ticketId: ticket.id
            },
          })}
        >
          {ticketTitle}
        </Typography>


      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Badge className={cn(configs.badge.bgClassName, "rounded-sm")}>
            <Typography className={configs.badge.textClassName}>{configs.label}</Typography>
          </Badge>
          <View className="self-start rounded-sm bg-primary/10 px-2 py-1">
            <Typography className="text-xs font-medium text-primary">{serviceTitle}</Typography>
          </View>

          {typeof ticket.rating === "number" ? (
            <View className="self-start flex-row items-center gap-1 rounded-sm bg-amber-100 px-2 py-1">
              <StarIcon size={12} color="#D97706" fill="#D97706" />
              <Typography className="text-xs font-semibold text-amber-700">
                {t("tickets.ratingScore", { rating: ticket.rating })}
              </Typography>
            </View>
          ) : null}
        </View>

        {ticket.status === "COMPLETED" ? null : (
          <View className="self-start flex-row items-center gap-1 rounded-full bg-purple-100 px-2.5 py-1">
            <ClockIcon size={16} color="#8b5cf6" />
            <Typography className="text-xs font-semibold text-purple-700">{formatRelativeTime(ticket.createdAt)}</Typography>
          </View>
        )}

        {/* {ticket.status === "COMPLETED" ? null : (
          isOverdue(ticket.dueDateTime) ? (
            <View className="self-start flex-row items-center gap-1 rounded-full bg-red-100 px-2.5 py-1">
              <AlertCircleIcon size={16} color="#b91c1c" />
              <Typography className="text-xs font-semibold text-red-700">
                Overdue: {formatOverdueDuration(ticket.dueDateTime) ?? "—"}
              </Typography>
            </View>
          ) : (
            <View className="self-start flex-row items-center gap-1 rounded-full bg-purple-100 px-2.5 py-1">
              <ClockIcon size={16} color="#8b5cf6" />
              <Typography className="text-xs font-semibold text-purple-700">{formatRelativeTime(ticket.createdAt)}</Typography>
            </View>
          )
        )} */}
      </View>
    </View>
  );
}

export function TicketListCard({ ticket }: { ticket: TicketListItem }) {
  return (
    <>
      <View className="flex-row items-start gap-4 p-4">
        <TicketAvatar category={ticket.ticketCategory} />
        <TicketCardText ticket={ticket} />
      </View>
      <Separator />
    </>
  );
}
