import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

import type { iTicketStatus } from "../types";

import {
  buildTicketFilterSummary,
  countActiveTicketFilters,
  createDefaultTicketFilter,
  getTicketFilterMonthOptions,
  getTicketFilterYearOptions,
  isAllWardsSelected,
  TICKET_FILTER_STATUSES,
  isAllStatusesSelected,
  toggleStatusSelection,
  toggleWardSelection,
  type TicketFilterSelection,
  type TicketFilterState,
} from "../hooks/use-tickets-filter";
import { getTicketStatusConfig } from "@/features/tickets/utils";
import {
  CogIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  XIcon,
} from "lucide-react-native";
import { useStaffAuth } from "@/components/provider/staff-auth-provider";
import { useStaffTicketFilterQuery } from "../hooks/use-staff-ticket-queries";

type TicketFilterProps = TicketFilterSelection;

export type ComplaintFilterProps = {
  selectedComplaintId: string | null;
  onSelectComplaint: (id: string | null) => void;
  complaintQuery?: string;
};

export type MonthYearFilterProps = {
  month: string;
  year: string;
  onSelectMonth: (month: string) => void;
  onSelectYear: (year: string) => void;
};

export type WardsFilterProps = {
  selectedWards: number[];
  onChangeSelectedWards: (wards: number[]) => void;
};

export type StatusFilterProps = {
  selectedStatuses: iTicketStatus[];
  onChangeSelectedStatuses: (statuses: iTicketStatus[]) => void;
};

export function StatusFilter({
  selectedStatuses,
  onChangeSelectedStatuses,
}: StatusFilterProps) {
  const handleToggleStatus = (status: iTicketStatus) => {
    onChangeSelectedStatuses(toggleStatusSelection(selectedStatuses, status));
  };

  return (
    <FilterChipRow label="Status">
      <FilterChip
        label="All"
        selected={isAllStatusesSelected(selectedStatuses)}
        onPress={() => onChangeSelectedStatuses([])}
      />
      {TICKET_FILTER_STATUSES.map((status) => (
        <FilterChip
          key={status}
          label={getTicketStatusConfig(status).label}
          selected={
            !isAllStatusesSelected(selectedStatuses) && selectedStatuses.includes(status)
          }
          onPress={() => handleToggleStatus(status)}
        />
      ))}
    </FilterChipRow>
  );
}

function FilterChipRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-2 py-3">
      <Text className="text-primary text-xs font-bold uppercase tracking-wide">{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2 pb-1">{children}</View>
      </ScrollView>
    </View>
  );
}

export function MonthYearFilter({
  month,
  year,
  onSelectMonth,
  onSelectYear,
}: MonthYearFilterProps) {
  const yearOptions = useMemo(() => getTicketFilterYearOptions(), []);
  const monthOptions = useMemo(() => getTicketFilterMonthOptions(year), [year]);

  return (
    <View className="gap-1">
      <FilterChipRow label="Year">
        {yearOptions.map((opt) => (
          <FilterChip
            key={opt.value}
            label={opt.label}
            selected={year === opt.value}
            onPress={() => onSelectYear(opt.value)}
          />
        ))}
      </FilterChipRow>

      <FilterChipRow label="Month">
        {monthOptions.map((opt) => (
          <FilterChip
            key={opt.value}
            label={opt.label}
            selected={month === opt.value}
            onPress={() => onSelectMonth(opt.value)}
          />
        ))}
      </FilterChipRow>
    </View>
  );
}

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "shrink-0 rounded-full border px-3.5 py-2 active:opacity-80",
        selected
          ? "border-primary bg-primary/15"
          : "border-border bg-muted/40",
      )}
    >
      <Text
        className={cn(
          "text-sm font-medium",
          selected ? "text-primary" : "text-foreground",
        )}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function WardsFilter({ selectedWards, onChangeSelectedWards }: WardsFilterProps) {
  const { staffInfo, isStaffInfoLoading, staffInfoError, refetchStaffInfo } = useStaffAuth();

  const wardOptions = useMemo(
    () => [...(staffInfo?.wards ?? [])].sort((a, b) => a - b),
    [staffInfo?.wards],
  );

  const handleToggleWard = (ward: number) => {
    onChangeSelectedWards(toggleWardSelection(selectedWards, ward));
  };

  return (
    <View className="gap-2 py-3">
      <Text className="text-primary text-xs font-bold uppercase tracking-wide">Ward</Text>

      {isStaffInfoLoading ? (
        <View className="flex-row items-center py-2">
          <ActivityIndicator size="small" />
          <Text className="text-muted-foreground ml-2 text-sm">Loading wards…</Text>
        </View>
      ) : null}

      {staffInfoError && !isStaffInfoLoading ? (
        <Pressable
          onPress={() => void refetchStaffInfo()}
          className="self-start rounded-md bg-destructive/10 px-3 py-2 active:opacity-80"
        >
          <Text className="text-destructive text-sm font-medium">
            Couldn’t load wards. Tap to retry.
          </Text>
        </Pressable>
      ) : null}

      {!isStaffInfoLoading && !staffInfoError ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2 pb-1">
            <FilterChip
              label="All"
              selected={isAllWardsSelected(selectedWards)}
              onPress={() => onChangeSelectedWards([])}
            />
            {wardOptions.map((ward) => (
              <FilterChip
                key={ward}
                label={`Ward ${ward}`}
                selected={!isAllWardsSelected(selectedWards) && selectedWards.includes(ward)}
                onPress={() => handleToggleWard(ward)}
              />
            ))}
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
}

export function ComplaintFilter({
  selectedComplaintId,
  onSelectComplaint,
  complaintQuery = "",
}: ComplaintFilterProps) {
  const { session } = useStaffAuth();
  const { data, isPending, isError, refetch, isRefetching } = useStaffTicketFilterQuery();

  const options = useMemo(
    () => data?.complaints ?? [],
    [data?.complaints],
  );

  const filteredOptions = useMemo(() => {
    const q = complaintQuery.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, complaintQuery]);

  return (
    <View className="gap-2 py-3">
      <Text className="text-primary text-xs font-bold uppercase tracking-wide">
        Complaint type
      </Text>

      {isPending ? (
        <View className="flex-row items-center py-2">
          <ActivityIndicator size="small" />
          <Text className="text-muted-foreground ml-2 text-sm">Loading filters…</Text>
        </View>
      ) : null}

      {isError && !isPending ? (
        <Pressable
          onPress={() => void refetch()}
          className="self-start rounded-md bg-destructive/10 px-3 py-2 active:opacity-80"
        >
          <Text className="text-destructive text-sm font-medium">
            {isRefetching ? "Retrying…" : "Couldn’t load filters. Tap to retry."}
          </Text>
        </Pressable>
      ) : null}

      {!isPending && !isError ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2 pb-1">
            <FilterChip
              label="All"
              selected={selectedComplaintId === null}
              onPress={() => onSelectComplaint(null)}
            />
            {filteredOptions.map((opt) => (
              <FilterChip
                key={opt.id}
                label={opt.label}
                selected={selectedComplaintId === opt.id}
                onPress={() => onSelectComplaint(opt.id)}
              />
            ))}
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
}

function AppliedFilterChip({
  label,
  bgClassName,
  textClassName,
}: {
  label: string;
  bgClassName: string;
  textClassName: string;
}) {
  return (
    <View className={cn("rounded-md px-2 py-0.5", bgClassName)}>
      <Text className={cn("text-xs font-medium", textClassName)} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function getSummaryChipStyles(
  chip: { key: string },
): { bgClassName: string; textClassName: string } {
  if (chip.key === "period") {
    return { bgClassName: "bg-sky-100", textClassName: "text-sky-700" };
  }
  if (chip.key === "complaint") {
    return { bgClassName: "bg-violet-100", textClassName: "text-violet-700" };
  }
  if (chip.key === "statuses") {
    return { bgClassName: "bg-slate-100", textClassName: "text-slate-700" };
  }
  if (chip.key.startsWith("status-")) {
    const status = chip.key.slice("status-".length) as iTicketStatus;
    const config = getTicketStatusConfig(status);
    return {
      bgClassName: config.badge.bgClassName,
      textClassName: config.badge.textClassName,
    };
  }
  if (chip.key === "wards" || chip.key.startsWith("ward-")) {
    return { bgClassName: "bg-emerald-100", textClassName: "text-emerald-700" };
  }
  if (chip.key === "search") {
    return { bgClassName: "bg-amber-100", textClassName: "text-amber-800" };
  }
  return { bgClassName: "bg-muted", textClassName: "text-foreground" };
}

function TicketFilterSummaryBar({
  filter,
  activeCount,
  onOpenFilters,
}: {
  filter: TicketFilterState;
  activeCount: number;
  onOpenFilters: () => void;
}) {
  const { session } = useStaffAuth();
  const { data: filterOptions } = useStaffTicketFilterQuery();

  const complaintLabel = useMemo(() => {
    if (!filter.selectedComplaintId) return undefined;
    return filterOptions?.complaints.find((c) => c.id === filter.selectedComplaintId)?.label;
  }, [filter.selectedComplaintId, filterOptions?.complaints]);

  const summaryChips = useMemo(
    () =>
      buildTicketFilterSummary(filter, { complaintLabel }).map((chip) => {
        const styles = getSummaryChipStyles(chip);
        if (chip.key.startsWith("status-")) {
          const status = chip.key.slice("status-".length) as iTicketStatus;
          return {
            ...chip,
            ...styles,
            label: getTicketStatusConfig(status).label,
          };
        }
        return { ...chip, ...styles };
      }),
    [filter, complaintLabel],
  );

  return (
    <View className="flex-row flex-wrap items-center gap-1.5 px-4 pb-2">
      {summaryChips.map((chip) => (
        <AppliedFilterChip
          key={chip.key}
          label={chip.label}
          bgClassName={chip.bgClassName}
          textClassName={chip.textClassName}
        />
      ))}

      <Pressable
        onPress={onOpenFilters}
        accessibilityRole="button"
        accessibilityLabel={
          activeCount > 0 ? `Filters, ${activeCount} active` : "Open filters"
        }
        className={cn(
          "shrink-0 flex-row items-center gap-1.5 rounded-full border px-3 py-1.5 active:opacity-80",
          activeCount > 0
            ? "border-primary bg-primary/15"
            : "border-border bg-muted/40",
        )}
      >
        <Icon
          as={SlidersHorizontalIcon}
          className={cn("size-3.5", activeCount > 0 ? "text-primary" : "text-muted-foreground")}
        />
        <Text
          className={cn(
            "text-xs font-semibold",
            activeCount > 0 ? "text-primary" : "text-foreground",
          )}
        >
          Filters
        </Text>
        {activeCount > 0 ? (
          <View className="h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1">
            <Text className="text-[10px] font-bold text-primary-foreground">{activeCount}</Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

export function TicketFilter({ filter, replaceFilter }: TicketFilterProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [draft, setDraft] = useState<TicketFilterState>(filter);

  const activeCount = useMemo(() => countActiveTicketFilters(filter), [filter]);

  useEffect(() => {
    if (isModalVisible) {
      setDraft(filter);
    }
  }, [isModalVisible, filter]);

  const patchDraft = (changes: Partial<TicketFilterState>) => {
    setDraft((prev) => ({ ...prev, ...changes }));
  };

  const handleClose = () => {
    setIsModalVisible(false);
  };

  const handleResetAll = () => {
    setDraft(createDefaultTicketFilter());
    replaceFilter(createDefaultTicketFilter());
    setIsModalVisible(false);
  };

  const handleApply = () => {
    replaceFilter(draft);
    setIsModalVisible(false);
  };

  return (
    <>
      <TicketFilterSummaryBar
        filter={filter}
        activeCount={activeCount}
        onOpenFilters={() => setIsModalVisible(true)}
      />

      <Modal
        transparent
        animationType="fade"
        visible={isModalVisible}
        onRequestClose={handleClose}
      >
        <View className="flex-1 justify-end bg-black/30">
          <Pressable className="flex-1" onPress={handleClose} />
          <View className="bg-card absolute bottom-0 h-[60vh] w-full flex-col rounded-t-3xl">
            <View className="flex-row items-center justify-between px-4 py-3">
              <View className="flex-row items-center gap-2">
                <Icon as={CogIcon} className="size-6 text-primary" />
                <Text className="text-primary text-lg font-bold">Filter & Sort Tickets</Text>
              </View>
              <Pressable onPress={handleClose} className="bg-muted h-9 w-9 items-center justify-center rounded-full">
                <XIcon size={18} color="#737373" />
              </Pressable>
            </View>

            <Separator />

            <ScrollView
              className="flex-1 px-4 pt-3"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View className="relative">
                <View className="pointer-events-none absolute left-3 top-0 z-10 h-10 justify-center">
                  <Icon as={SearchIcon} size={16} className="text-muted-foreground" />
                </View>
                <Input
                  value={draft.query}
                  onChangeText={(q) => patchDraft({ query: q })}
                  placeholder="Search problems..."
                  className="pl-9"
                  autoCorrect={false}
                  autoCapitalize="none"
                  clearButtonMode="while-editing"
                />
              </View>

              <WardsFilter
                selectedWards={draft.selectedWards}
                onChangeSelectedWards={(wards) => patchDraft({ selectedWards: wards })}
              />

              <MonthYearFilter
                month={draft.month}
                year={draft.year}
                onSelectMonth={(m) => patchDraft({ month: m })}
                onSelectYear={(y) => patchDraft({ year: y })}
              />

              <StatusFilter
                selectedStatuses={draft.selectedStatuses}
                onChangeSelectedStatuses={(statuses) =>
                  patchDraft({ selectedStatuses: statuses })
                }
              />

              <ComplaintFilter
                selectedComplaintId={draft.selectedComplaintId}
                onSelectComplaint={(id) => patchDraft({ selectedComplaintId: id })}
                complaintQuery={draft.query}
              />
            </ScrollView>

            <Separator />

            <View className="flex-row gap-3 bg-card px-4 py-3">
              <Button variant="outline" className="flex-1" onPress={handleResetAll}>
                <Text className="font-semibold">Reset All</Text>
              </Button>
              <Button variant="default" className="flex-1" onPress={handleApply}>
                <Text className="font-semibold text-primary-foreground">Apply</Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </>
  )
}