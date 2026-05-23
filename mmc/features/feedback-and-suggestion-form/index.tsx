import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { useAuthContext } from "@/components/provider/auth-provider";

export default function FeedbackAndSuggestionForm() {
  const { authType } = useAuthContext();
  return (
    <View>
      <Text>Feedback And Suggestion Form</Text>
    </View>
  );
}