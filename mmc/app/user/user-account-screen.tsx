import { Stack } from "expo-router";
import { View } from "react-native";

import { BottomNav } from "@/components/common/bottom-nav";
import { Account } from "@/features/account";

export default function UserAccountScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-background flex-1">
        <Account />

        <BottomNav activeItemId="account" />
      </View>
    </>
  )
}