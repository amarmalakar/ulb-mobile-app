import { Alert, Pressable, TextInput, View } from "react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SendHorizonal } from "lucide-react-native";
import { Typography } from "@/components/common/typography";
import { useUserAuth } from "@/components/providers/user-auth-provider";
import { usePostUserTicketCommentMutation } from "@/features/tickets/hooks/use-user-ticket-comment-mutation";

export function TicketUserCommentComposer({
  ticketId,
  commentEnabled,
  onFocus,
}: {
  ticketId: string;
  commentEnabled: boolean;
  onFocus?: () => void;
}) {
  const { t } = useTranslation();
  const { session } = useUserAuth();
  const [draftComment, setDraftComment] = useState("");

  const { mutate: postComment, isPending: isPostingComment } = usePostUserTicketCommentMutation();

  const canCompose = commentEnabled && Boolean(session?.accessToken);

  const handleAddComment = () => {
    const trimmedComment = draftComment.trim();
    if (!trimmedComment || !canCompose) return;
    postComment(
      { ticketId, body: { comment: trimmedComment } },
      {
        onSuccess: () => setDraftComment(""),
        onError: (err: Error) => {
          Alert.alert(t("tickets.couldNotAddComment"), err.message);
        },
      },
    );
  };

  return (
    <View className="rounded-xl border border-border bg-card p-3">
      <TextInput
        value={draftComment}
        onChangeText={setDraftComment}
        onFocus={onFocus}
        multiline
        editable={canCompose}
        placeholder={
          commentEnabled ? t("tickets.writeComment") : t("tickets.commentsDisabledPlaceholder")
        }
        placeholderTextColor="#9CA3AF"
        className="min-h-20 text-base text-foreground font-sans"
        style={{ textAlignVertical: "top" }}
      />
      <View className="mt-2 flex-row justify-end">
        <Pressable
          onPress={handleAddComment}
          disabled={!draftComment.trim() || isPostingComment || !canCompose}
          className={`flex-row items-center gap-1.5 rounded-lg px-3 py-2 ${draftComment.trim() && !isPostingComment && canCompose ? "bg-primary" : "bg-muted"
            }`}
        >
          <SendHorizonal
            size={14}
            color={draftComment.trim() && !isPostingComment && canCompose ? "white" : "#64748B"}
          />
          <Typography
            variant="caption"
            weight="semibold"
            className={
              draftComment.trim() && !isPostingComment && canCompose
                ? "text-primary-foreground"
                : "text-muted-foreground"
            }
          >
            {isPostingComment ? t("tickets.addingComment") : t("tickets.addComment")}
          </Typography>
        </Pressable>
      </View>
    </View>
  );
}
