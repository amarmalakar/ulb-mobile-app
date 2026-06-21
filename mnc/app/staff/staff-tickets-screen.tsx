import { useEffect, useMemo } from "react";
import { View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import {
  createDefaultTicketFilter,
  parseStaffTicketsRouteParams,
  type StaffTicketsRouteParams,
  useTicketFilter,
} from "@/features/tickets/hooks/use-tickets-filter";
import { useStaffTicketsInfiniteQuery } from "@/features/tickets/hooks/use-staff-tickets-query";
import type { StaffTicketsListFilterParams } from "@/features/tickets/types";
import { useStaffAuth } from "@/components/providers/staff-auth-provider";
import { useTranslation } from "react-i18next";
import { BottomNav } from "@/components/common/bottom-nav";
import { TopNavigation } from "@/components/common/top-navigation";
import { TicketFilter } from "@/features/tickets/components/ticket-filter";
import { StaffTicketList } from "@/features/tickets/components/staff-ticket-list";
import { getLocaleString } from "@/lib/i18n/get-locale-string";

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
  const searchParams = useLocalSearchParams<StaffTicketsRouteParams>();

  const { filterPatch, data } = useMemo(
    () => parseStaffTicketsRouteParams(searchParams),
    [
      searchParams.params,
      searchParams.data,
      searchParams.selectedServiceId,
      searchParams.selectedStatuses,
      searchParams.selectedWards,
    ],
  );

  useEffect(() => {
    if (Object.keys(filterPatch).length === 0) return;
    ticketFilter.replaceFilter({
      ...createDefaultTicketFilter(),
      ...filterPatch,
    });
  }, [filterPatch, ticketFilter.replaceFilter]);

  const listFilter = useMemo(
    () => toListFilter(ticketFilter.filter),
    [ticketFilter.filter],
  );

  const ticketsQuery = useStaffTicketsInfiniteQuery(listFilter, {
    enabled: sessionHydrated,
  });

  const screenTitle = data?.title
    ? getLocaleString(data.title)
    : t("tickets.title");

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-background flex-1 gap-4">
        <TopNavigation label={screenTitle} isBackButton={true} />
        <TicketFilter {...ticketFilter} />
        <StaffTicketList ticketsQuery={ticketsQuery} />

        <BottomNav activeItemId="tickets" />
      </View>
    </>
  );
}
