import { useEffect, useMemo } from "react";
import { View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { Typography } from "@/components/common/typography";
import { createDefaultTicketFilter, parseStaffTicketScreenParams, StaffTicketScreenSearchParams, useTicketFilter } from "@/features/tickets/hooks/use-tickets-filter";
import { useStaffTicketsInfiniteQuery } from "@/features/tickets/hooks/use-staff-tickets-query";
import type { StaffTicketsListFilterParams } from "@/features/tickets/types";
import { useStaffAuth } from "@/components/providers/staff-auth-provider";
import { useTranslation } from "react-i18next";
import { BottomNav } from "@/components/common/bottom-nav";
import { TopNavigation } from "@/components/common/top-navigation";
import { TicketFilter } from "@/features/tickets/components/ticket-filter";
import { StaffTicketList } from "@/features/tickets/components/staff-ticket-list";

function toListFilter(
  filter: ReturnType<typeof useTicketFilter>["filter"],
): StaffTicketsListFilterParams {
  return {
    query: filter.query,
    selectedServiceId: filter.selectedServiceId,
    selectedStatuses: filter.selectedStatuses,
    month: filter.month,
    year: filter.year,
    selectedWards: filter.selectedWards,
    limit: filter.limit,
  };
}

export default function StaffTicketsScreen() {
  const { t } = useTranslation();
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
    searchParams.selectedServiceId,
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

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-background flex-1 gap-4">
        <TopNavigation label={t("tickets.title")} isBackButton={true} />
        <TicketFilter {...ticketFilter} />
        <StaffTicketList ticketsQuery={ticketsQuery} />

        <BottomNav activeItemId="tickets" />
      </View>
    </>
  );
}