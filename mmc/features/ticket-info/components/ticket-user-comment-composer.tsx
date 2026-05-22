import { Alert, Pressable, TextInput, View } from "react-native";
import { useState } from "react";
import { SendHorizonal } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { useUserAuth } from "@/components/provider/user-auth-provider";
import { usePostUserTicketCommentMutation } from "@/features/tickets/hooks/use-ticket-queries";

export function TicketUserCommentComposer({
  ticketId,
  commentEnabled,
}: {
  ticketId: string;
  commentEnabled: boolean;
}) {
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
          Alert.alert("Could not add comment", err.message);
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
        placeholder={commentEnabled ? "Write a comment..." : "Comments are disabled"}
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
            {isPostingComment ? "Adding..." : "Add Comment"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
