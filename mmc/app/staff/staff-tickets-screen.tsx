import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { Stack } from "expo-router";
import { BottomNav } from "@/components/common/bottom-nav";
import { TopNavigation } from "@/components/common/top-navigation";

export default function StaffTicketsScreen() {

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-background flex-1">
        <TopNavigation label="Tickets" isBackButton={true} />
        <Text>Staff Tickets Screen</Text>

        <BottomNav activeItemId="tickets" />
      </View>
    </>
  )
}