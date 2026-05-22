import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { Stack } from "expo-router";
import { BottomNav } from "@/components/common/bottom-nav";

export default function UserTicketsScreen() {

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-background flex-1">
        <Text>User Tickets Screen</Text>

        <BottomNav activeItemId="tickets" />
      </View>
    </>
  )
}