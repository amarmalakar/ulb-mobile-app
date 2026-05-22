import { useEffect, useMemo } from "react";
import { View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";

import { Text } from "@/components/ui/text";

import { BottomNav } from "@/components/common/bottom-nav";
import { TopNavigation } from "@/components/common/top-navigation";
import { useStaffTicketsInfiniteQuery } from "@/features/tickets/hooks/use-staff-ticket-queries";
import { createDefaultTicketFilter, parseStaffTicketScreenParams, StaffTicketScreenSearchParams, useTicketFilter } from "@/features/tickets/hooks/use-tickets-filter";
import { StaffTicketsListFilterParams } from "@/features/tickets/types";
import { useStaffAuth } from "@/components/provider/staff-auth-provider";
import { TicketFilter } from "@/features/tickets/components/ticket-filter";
import { StaffTicketList } from "@/features/tickets/components/staff-ticket-list";

function toListFilter(
  filter: ReturnType<typeof useTicketFilter>["filter"],
): StaffTicketsListFilterParams {
  return {
    query: filter.query,
    selectedComplaintId: filter.selectedComplaintId,
    selectedStatuses: filter.selectedStatuses,
    month: filter.month,
    year: filter.year,
    selectedWards: filter.selectedWards,
    limit: filter.limit,
  };
}

function formatTicketTotal(total: number): string {
  return total === 1 ? "1 ticket" : `${total} tickets`;
}

export default function StaffTicketsScreen() {
  const { sessionHydrated } = useStaffAuth();
  const ticketFilter = useTicketFilter();
  const searchParams = useLocalSearchParams<StaffTicketScreenSearchParams>();

  useEffect(() => {
    const patch = parseStaffTicketScreenParams(searchParams);
    if (Object.keys(patch).length === 0) return;
    ticketFilter.replaceFilter({
      ...createDefaultTicketFilter(),
      ...patch,
    });
  }, [
    searchParams.selectedComplaintId,
    searchParams.selectedStatuses,
    searchParams.selectedWards,
    ticketFilter.replaceFilter,
  ]);

  const listFilter = useMemo(
    () => toListFilter(ticketFilter.filter),
    [ticketFilter.filter],
  );

  const ticketsQuery = useStaffTicketsInfiniteQuery(listFilter, {
    enabled: sessionHydrated,
  });

  const totalTickets = ticketsQuery.data?.pages[0]?.total;

  const totalLabel = useMemo(() => {
    if (ticketsQuery.isLoading) {
      return "Loading…";
    }
    if (ticketsQuery.isError) {
      return null;
    }
    return formatTicketTotal(totalTickets ?? 0);
  }, [
    sessionHydrated,
    ticketsQuery.isLoading,
    ticketsQuery.isError,
    totalTickets,
  ]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-background flex-1 gap-4">
        <TopNavigation label="Tickets" isBackButton={true} />
        <TicketFilter {...ticketFilter} />
				<StaffTicketList ticketsQuery={ticketsQuery} />

        <BottomNav activeItemId="tickets" />
      </View>
    </>
  )
}