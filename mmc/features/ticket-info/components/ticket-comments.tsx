import { format, isValid, parseISO } from "date-fns";
import { enGB } from "date-fns/locale";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { View } from "react-native";

import type { StaffTicketComment, UserTicketComment } from "@/features/tickets/types";

import { Text } from "@/components/ui/text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { TicketInfoAuthType } from "../types";

import { TicketStaffCommentComposer } from "./ticket-staff-comment-composer";
import { TicketUserCommentComposer } from "./ticket-user-comment-composer";

function formatCommentTime(value: string) {
  const parsed = parseISO(value);
  if (!isValid(parsed)) {
    return value;
  }

  const datePart = format(parsed, "dd MMM yyyy", { locale: enGB }).toUpperCase();
  const timePart = format(parsed, "h:mm a").replace(/\s/g, "");

  return `${datePart}, ${timePart}`;
}

type TicketComment = UserTicketComment | StaffTicketComment;

function getCommentAuthor(
  item: TicketComment,
  t: TFunction,
): { name: string; avatar: string | null | undefined } {
  if (item.authorType === "STAFF" && item.authorStaff) {
    return { name: item.authorStaff.name, avatar: item.authorStaff.imgProfileUrl };
  }
  if (item.authorType === "USER" && item.authorUser) {
    return { name: item.authorUser.name, avatar: undefined };
  }
  if (item.authorType === "SYSTEM") {
    return { name: t("tickets.system"), avatar: undefined };
  }
  return { name: t("tickets.unknown"), avatar: undefined };
}

export function TicketComments({
  comments,
  ticketId,
  commentEnabled,
  authType,
}: {
  comments: TicketComment[];
  ticketId: string;
  commentEnabled: boolean;
  authType: TicketInfoAuthType;
}) {
  const { t } = useTranslation();
  const hasComments = comments.length > 0;

  const sortedComments = useMemo(
    () =>
      [...comments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [comments],
  );

  return (
    <View className="gap-4">
      {!commentEnabled ? (
        <Text className="text-sm text-muted-foreground">{t("tickets.commentsDisabled")}</Text>
      ) : null}

      {authType === "User" ? (
        <TicketUserCommentComposer ticketId={ticketId} commentEnabled={commentEnabled} />
      ) : (
        <TicketStaffCommentComposer ticketId={ticketId} commentEnabled={commentEnabled} />
      )}

      {hasComments ? (
        <View className="gap-3">
          {sortedComments.map((item) => {
            const { name: commentBy, avatar } = getCommentAuthor(item, t);
            const initials = commentBy
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase() ?? "")
              .join("");

            return (
              <View key={item.id} className="rounded-xl bg-card p-4">
                <View className="flex-row items-center gap-3">
                  <Avatar alt={`${commentBy} avatar`}>
                    {avatar ? <AvatarImage src={avatar} /> : null}
                    <AvatarFallback>
                      <Text className="text-xs font-semibold text-foreground">{initials}</Text>
                    </AvatarFallback>
                  </Avatar>

                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">{commentBy}</Text>
                    <Text className="text-xs text-muted-foreground">
                      {formatCommentTime(item.createdAt)}
                    </Text>
                  </View>
                </View>

                <Text className="mt-3 text-sm leading-6 text-foreground">{item.comment}</Text>
              </View>
            );
          })}
        </View>
      ) : (
        <View className="rounded-xl border border-dashed border-muted-foreground/40 bg-muted/30 p-4">
          <Text className="text-sm text-muted-foreground">{t("tickets.noComments")}</Text>
        </View>
      )}
    </View>
  );
}
