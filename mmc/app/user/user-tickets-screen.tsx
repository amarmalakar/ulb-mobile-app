import { View } from "react-native";
import { Stack } from "expo-router";

import { BottomNav } from "@/components/common/bottom-nav";
import { TopNavigation } from "@/components/common/top-navigation";
import { useUserAuth } from "@/components/provider/user-auth-provider";
import { UserTicketList } from "@/features/tickets/components/user-ticket-list";
import { useUserTicketsInfiniteQuery } from "@/features/tickets/hooks/use-ticket-queries";

export default function UserTicketsScreen() {
  const { sessionHydrated } = useUserAuth();
  const ticketsQuery = useUserTicketsInfiniteQuery({
    limit: 10,
    enabled: sessionHydrated,
  });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-background flex-1">
        <TopNavigation label="Tickets" isBackButton={true} />
        <UserTicketList ticketsQuery={ticketsQuery} />
        <BottomNav activeItemId="tickets" />
      </View>
    </>
  );
}
