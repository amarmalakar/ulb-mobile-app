import { Alert, Pressable, TextInput, View } from "react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SendHorizonal } from "lucide-react-native";

import { Text } from "@/components/ui/text";
import { useStaffAuth } from "@/components/provider/staff-auth-provider";
import { usePostStaffTicketCommentMutation } from "@/features/tickets/hooks/use-staff-ticket-queries";

export function TicketStaffCommentComposer({
  ticketId,
  commentEnabled,
}: {
  ticketId: string;
  commentEnabled: boolean;
}) {
  const { t } = useTranslation();
  const { session } = useStaffAuth();
  const [draftComment, setDraftComment] = useState("");

  const { mutate: postComment, isPending: isPostingComment } = usePostStaffTicketCommentMutation();

  const canCompose = commentEnabled && Boolean(session?.accessToken);

  const handleAddComment = () => {
    const trimmedComment = draftComment.trim();
    if (!trimmedComment || !canCompose) return;
    postComment(
      { ticketId, body: { comment: trimmedComment } },
      {
        onSuccess: () => setDraftComment(""),
        onError: (err) => {
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
        multiline
        editable={canCompose}
        placeholder={
          commentEnabled ? t("tickets.writeComment") : t("tickets.commentsDisabledPlaceholder")
        }
        placeholderTextColor="#9CA3AF"
        className="min-h-20 text-base text-foreground"
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
          <Text
            className={`text-xs font-semibold ${draftComment.trim() && !isPostingComment && canCompose
                ? "text-primary-foreground"
                : "text-muted-foreground"
              }`}
          >
            {isPostingComment ? t("tickets.addingComment") : t("tickets.addComment")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
