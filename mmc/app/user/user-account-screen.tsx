import { Stack } from "expo-router";
import { View } from "react-native";

import { Text } from "@/components/ui/text";
import { BottomNav } from "@/components/common/bottom-nav";

export default function UserAccountScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-background flex-1">
        <Text className="text-2xl font-bold">User Account Screen</Text>

        <BottomNav activeItemId="account" />
      </View>
    </>
  )
}