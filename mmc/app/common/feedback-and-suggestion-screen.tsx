import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Text } from "@/components/ui/text";

export default function FeedbackAndSuggestionScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-background flex-1">
        <Text className="text-2xl font-bold">{t("feedback.title")}</Text>
      </View>
    </>
  )
}