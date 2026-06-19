import { format, isValid, parseISO } from "date-fns";
import { enGB } from "date-fns/locale";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { View } from "react-native";

import type { StaffTicketComment, UserTicketComment } from "@/features/tickets/types";

import { Typography } from "@/components/common/typography";
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
  onComposerFocus,
}: {
  comments: TicketComment[];
  ticketId: string;
  commentEnabled: boolean;
  authType: TicketInfoAuthType;
  onComposerFocus?: () => void;
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
        <Typography className="text-sm text-muted-foreground">{t("tickets.commentsDisabled")}</Typography>
      ) : null}

      {authType === "User" ? (
        <TicketUserCommentComposer
          ticketId={ticketId}
          commentEnabled={commentEnabled}
          onFocus={onComposerFocus}
        />
      ) : (
        <TicketStaffCommentComposer
          ticketId={ticketId}
          commentEnabled={commentEnabled}
          onFocus={onComposerFocus}
        />
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
                      <Typography className="text-xs font-semibold text-foreground">{initials}</Typography>
                    </AvatarFallback>
                  </Avatar>

                  <View className="flex-1">
                    <Typography className="text-sm font-semibold text-foreground">{commentBy}</Typography>
                    <Typography className="text-xs text-muted-foreground">
                      {formatCommentTime(item.createdAt)}
                    </Typography>
                  </View>
                </View>

                <Typography className="mt-3 text-sm leading-6 text-foreground">{item.comment}</Typography>
              </View>
            );
          })}
        </View>
      ) : (
        <View className="rounded-xl border border-dashed border-muted-foreground/40 bg-muted/30 p-4">
          <Typography className="text-sm text-muted-foreground">{t("tickets.noComments")}</Typography>
        </View>
      )}
    </View>
  );
}
