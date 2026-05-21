import { Stack } from "expo-router";
import { View } from "react-native";

import { Text } from "@/components/ui/text";

export default function FeedbackAndSuggestionScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-background flex-1">
        <Text className="text-2xl font-bold">Feedback and Suggestion Screen</Text>
      </View>
    </>
  )
}