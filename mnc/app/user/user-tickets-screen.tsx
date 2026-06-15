import { BottomNav } from "@/components/common/bottom-nav";
import { TopNavigation } from "@/components/common/top-navigation";
import { Typography } from "@/components/common/typography";
import { useUserAuth } from "@/components/providers/user-auth-provider";
import { useUserTicketsInfiniteQuery } from "@/features/tickets/hooks/use-user-tickets-query";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, View } from "react-native";
import { UserBookingListLoader, UserBookingListError, UserBookingListEmpty } from "@/app/user/user-your-booking-screen";
import { TicketListItem } from "@/features/tickets/types";
import { TicketListCard } from "@/features/tickets/components/ticket-list-card";

export default function UserTicketsScreen() {
  const { t } = useTranslation();
  const { sessionHydrated, mpinUnlocked } = useUserAuth();

  const {
    data,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching
  } = useUserTicketsInfiniteQuery({
    limit: 10,
    enabled: sessionHydrated && mpinUnlocked,
  });
  const tickets = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-background flex-1">
        <TopNavigation label={t('tickets.title')} isBackButton={true} />

        {isLoading ? (
          <UserBookingListLoader />
        ) : isError ? (
          <UserBookingListError message={error?.message} onRetry={() => void refetch()} />
        ) : tickets.length === 0 ? (
          <UserBookingListEmpty title={t('tickets.emptyTitle')} hint={t('tickets.emptyHint')} />
        ) : (
          <FlatList
            data={tickets}
            keyExtractor={(item) => item.id}
            className="flex-1"
            contentContainerStyle={{ gap: 12, paddingBottom: 112 }}
            showsVerticalScrollIndicator={false}
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={() => void refetch()}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                void fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.4}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View className="items-center py-4">
                  <ActivityIndicator />
                </View>
              ) : null
            }
            renderItem={({ item }: { item: TicketListItem }) => (
              <TicketListCard ticket={item} />
            )}
          />
        )}

        <BottomNav activeItemId="tickets" />
      </View>
    </>
  );
}
