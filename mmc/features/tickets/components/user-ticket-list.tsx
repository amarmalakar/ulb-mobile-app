import { ActivityIndicator, FlatList, View } from "react-native";
import type { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import { AlertCircleIcon, HistoryIcon, RefreshCcwIcon } from "lucide-react-native";

import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { TicketListItem, UserTicketsPage } from "@/features/tickets/types";
import { TicketListCard } from "./ticket-list-card";

function UserTicketListLoader() {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" />
    </View>
  );
}

function UserTicketListError({
  onRetry,
  message,
}: {
  onRetry: () => void;
  message?: string;
}) {
  return (
    <View className="flex-1 items-center justify-center gap-4 p-4">
      <View className="bg-destructive/10 size-20 items-center justify-center rounded-full">
        <Icon as={AlertCircleIcon} className="text-destructive" size={40} />
      </View>
      <View className="gap-1.5">
        <Text className="text-destructive text-center text-lg font-bold">Something went wrong</Text>
        <Text className="text-muted-foreground text-center text-sm">
          {message ?? "Please try again later."}
        </Text>
      </View>
      <Button size="sm" variant="outline" onPress={onRetry}>
        <Icon as={RefreshCcwIcon} className="size-4" />
        <Text>Retry</Text>
      </Button>
    </View>
  );
}

function UserTicketListEmpty() {
  return (
    <View className="flex-1 items-center justify-center gap-5 px-6 py-12">
      <View className="bg-muted size-20 items-center justify-center rounded-full">
        <Icon as={HistoryIcon} className="text-muted-foreground" size={40} />
      </View>
      <View className="gap-1.5">
        <Text className="text-foreground text-center text-xl font-bold">No tickets yet</Text>
        <Text className="text-muted-foreground max-w-[300px] text-center text-sm leading-relaxed">
          When you submit a complaint from the home screen, it will show up here so you can
          track its status.
        </Text>
      </View>
    </View>
  );
}

export type UserTicketListProps = {
  ticketsQuery: UseInfiniteQueryResult<InfiniteData<UserTicketsPage>, Error>;
};

export function UserTicketList({ ticketsQuery }: UserTicketListProps) {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = ticketsQuery;

  const tickets = data?.pages.flatMap((page) => page.items) ?? [];

  if (isLoading) {
    return <UserTicketListLoader />;
  }

  if (isError) {
    return (
      <UserTicketListError
        onRetry={() => void refetch()}
        message={error?.message}
      />
    );
  }

  if (tickets.length === 0) {
    return <UserTicketListEmpty />;
  }

  return (
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
  );
}
