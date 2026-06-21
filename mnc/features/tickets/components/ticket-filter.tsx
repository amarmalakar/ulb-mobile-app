import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/common/typography";
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
import { useStaffAuth } from "@/components/providers/staff-auth-provider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStaffTicketFilterQuery } from "../hooks/use-staff-ticket-filter-query";
import { getDateFnsLocale } from "@/lib/date-fns-locale";
import { getLocaleString } from "@/lib/i18n/get-locale-string";

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
  const { t } = useTranslation();
  const handleToggleStatus = (status: iTicketStatus) => {
    onChangeSelectedStatuses(toggleStatusSelection(selectedStatuses, status));
  };

  return (
    <FilterChipRow label={t("tickets.filterStatus")}>
      <FilterChip
        label={t("common.all")}
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
      <Typography className="text-primary text-xs font-bold uppercase tracking-wide">{label}</Typography>
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
  const { t, i18n } = useTranslation();
  const dateLocale = useMemo(() => getDateFnsLocale(i18n.language), [i18n.language]);
  const yearOptions = useMemo(() => getTicketFilterYearOptions(), []);
  const monthOptions = useMemo(
    () => getTicketFilterMonthOptions(year, dateLocale),
    [year, dateLocale],
  );

  return (
    <View className="gap-1">
      <FilterChipRow label={t("tickets.filterYear")}>
        {yearOptions.map((opt) => (
          <FilterChip
            key={opt.value}
            label={opt.label}
            selected={year === opt.value}
            onPress={() => onSelectYear(opt.value)}
          />
        ))}
      </FilterChipRow>

      <FilterChipRow label={t("tickets.filterMonth")}>
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
      <Typography
        className={cn(
          "text-sm font-medium",
          selected ? "text-primary" : "text-foreground",
        )}
        numberOfLines={1}
      >
        {label}
      </Typography>
    </Pressable>
  );
}

export function WardsFilter({ selectedWards, onChangeSelectedWards }: WardsFilterProps) {
  const { t } = useTranslation();
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
      <Typography className="text-primary text-xs font-bold uppercase tracking-wide">
        {t("tickets.filterWard")}
      </Typography>

      {isStaffInfoLoading ? (
        <View className="flex-row items-center py-2">
          <ActivityIndicator size="small" />
          <Typography className="text-muted-foreground ml-2 text-sm">{t("tickets.loadingWards")}</Typography>
        </View>
      ) : null}

      {staffInfoError && !isStaffInfoLoading ? (
        <Pressable
          onPress={() => void refetchStaffInfo()}
          className="self-start rounded-md bg-destructive/10 px-3 py-2 active:opacity-80"
        >
          <Typography className="text-destructive text-sm font-medium">
            {t("tickets.wardsLoadRetry")}
          </Typography>
        </Pressable>
      ) : null}

      {!isStaffInfoLoading && !staffInfoError ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2 pb-1">
            <FilterChip
              label={t("common.all")}
              selected={isAllWardsSelected(selectedWards)}
              onPress={() => onChangeSelectedWards([])}
            />
            {wardOptions.map((ward) => (
              <FilterChip
                key={ward}
                label={t("common.wardNumber", { ward })}
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
  const { t } = useTranslation();
  const { data, isPending, isError, refetch, isRefetching } = useStaffTicketFilterQuery();

  const options = useMemo(
    () => data?.services ?? [],
    [data?.services],
  );

  const filteredOptions = useMemo(() => {
    const q = complaintQuery.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => {
      const en = opt.title.en?.toLowerCase() ?? "";
      const hi = opt.title.hi?.toLowerCase() ?? "";
      return en.includes(q) || hi.includes(q);
    });
  }, [options, complaintQuery]);

  return (
    <View className="gap-2 py-3">
      <Typography className="text-primary text-xs font-bold uppercase tracking-wide">
        {t("tickets.filterServiceType")}
      </Typography>

      {isPending ? (
        <View className="flex-row items-center py-2">
          <ActivityIndicator size="small" />
          <Typography className="text-muted-foreground ml-2 text-sm">{t("tickets.loadingFilters")}</Typography>
        </View>
      ) : null}

      {isError && !isPending ? (
        <Pressable
          onPress={() => void refetch()}
          className="self-start rounded-md bg-destructive/10 px-3 py-2 active:opacity-80"
        >
          <Typography className="text-destructive text-sm font-medium">
            {isRefetching ? t("tickets.retrying") : t("tickets.filtersLoadRetry")}
          </Typography>
        </Pressable>
      ) : null}

      {!isPending && !isError ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2 pb-1">
            <FilterChip
              label={t("common.all")}
              selected={selectedComplaintId === null}
              onPress={() => onSelectComplaint(null)}
            />
            {filteredOptions.map((opt) => (
              <FilterChip
                key={opt.id}
                label={getLocaleString(opt.title)}
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
      <Typography className={cn("text-xs font-medium", textClassName)} numberOfLines={1}>
        {label}
      </Typography>
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
  const { t, i18n } = useTranslation();
  const { data: filterOptions } = useStaffTicketFilterQuery();
  const dateLocale = useMemo(() => getDateFnsLocale(i18n.language), [i18n.language]);

  const serviceLabel = useMemo(() => {
    if (!filter.selectedServiceId) return undefined;
    const service = filterOptions?.services.find(
      (item) => item.id === filter.selectedServiceId,
    );
    return service ? getLocaleString(service.title) : undefined;
  }, [filter.selectedServiceId, filterOptions?.services, i18n.language]);

  const summaryChips = useMemo(
    () =>
      buildTicketFilterSummary(filter, { serviceLabel, dateLocale }).map((chip) => {
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
    [filter, serviceLabel, dateLocale],
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
          activeCount > 0
            ? t("tickets.filtersActive", { count: activeCount })
            : t("tickets.openFilters")
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
        <Typography
          className={cn(
            "text-xs font-semibold",
            activeCount > 0 ? "text-primary" : "text-foreground",
          )}
        >
          {t("tickets.filters")}
        </Typography>
        {activeCount > 0 ? (
          <View className="h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1">
            <Typography className="text-[10px] font-bold text-primary-foreground">{activeCount}</Typography>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

export function TicketFilter({ filter, replaceFilter }: TicketFilterProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
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
                <Typography className="text-primary text-lg font-bold">{t("tickets.filterTitle")}</Typography>
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
              {/* <View className="relative">
                <View className="pointer-events-none absolute left-3 top-0 z-10 h-10 justify-center">
                  <Icon as={SearchIcon} size={16} className="text-muted-foreground" />
                </View>
                <Input
                  value={draft.query}
                  onChangeText={(q) => patchDraft({ query: q })}
                  placeholder={t("common.searchProblems")}
                  className="pl-9"
                  autoCorrect={false}
                  autoCapitalize="none"
                  clearButtonMode="while-editing"
                />
              </View> */}

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
                selectedComplaintId={draft.selectedServiceId}
                onSelectComplaint={(id) => patchDraft({ selectedServiceId: id })}
                complaintQuery={draft.query}
              />

              <View className="h-12" />
            </ScrollView>

            <Separator />

            <View className="flex-row gap-3 bg-card px-4 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
              <Button variant="outline" className="flex-1" onPress={handleResetAll}>
                <Typography className="font-semibold">{t("common.resetAll")}</Typography>
              </Button>
              <Button variant="default" className="flex-1" onPress={handleApply}>
                <Typography className="font-semibold text-primary-foreground">{t("common.apply")}</Typography>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </>
  )
}