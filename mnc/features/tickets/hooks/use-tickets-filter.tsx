import {
  eachMonthOfInterval,
  eachYearOfInterval,
  endOfYear,
  format,
  getYear,
  parse,
  startOfYear,
  type Locale,
} from "date-fns";
import { getAppLocale } from "@/lib/i18n";
import { getDateFnsLocale } from "@/lib/date-fns-locale";
import type { iLocalizedTitle, iTicketStatus } from "@/features/tickets/types";
import { useCallback, useState } from "react";

export const TICKET_FILTER_YEAR_START = 2026;

export const TICKET_FILTER_STATUSES: iTicketStatus[] = [
  "TODO",
  "IN_PROGRESS",
  "COMPLETED",
  "BLOCKED",
  "REOPENED",
];

export type TicketFilterState = {
  query: string;
  /** `null` means all services (no filter). */
  selectedServiceId: string | null;
  /** Empty array means all statuses (no filter). */
  selectedStatuses: iTicketStatus[];
  /** Calendar month `01`–`12`. */
  month: string;
  year: string;
  /** Empty array means all wards; otherwise one or more ward numbers. */
  selectedWards: number[];
  page: number;
  limit: number;
};

export type TicketFilterSelection = {
  filter: TicketFilterState;
  handleFilter: (changes: Partial<TicketFilterState>) => void;
  replaceFilter: (next: TicketFilterState) => void;
  resetFilter: () => void;
};

export type TicketFilterDateOption = { value: string; label: string };

export function createDefaultTicketFilter(): TicketFilterState {
  const now = new Date();
  return {
    query: "",
    selectedServiceId: null,
    selectedStatuses: [],
    month: format(now, "MM"),
    year: format(now, "yyyy"),
    selectedWards: [],
    page: 1,
    limit: 10,
  };
}

export function isAllWardsSelected(selectedWards: number[]): boolean {
  return selectedWards.length === 0;
}

/** Toggle a ward chip; `[]` = All. */
export function toggleWardSelection(current: number[], ward: number): number[] {
  if (isAllWardsSelected(current)) {
    return [ward];
  }
  if (current.includes(ward)) {
    const next = current.filter((w) => w !== ward);
    return next.length === 0 ? [] : next;
  }
  return [...current, ward].sort((a, b) => a - b);
}

export function isAllStatusesSelected(selectedStatuses: iTicketStatus[]): boolean {
  return selectedStatuses.length === 0;
}

/** Toggle a status chip; `[]` = All. */
export function toggleStatusSelection(
  current: iTicketStatus[],
  status: iTicketStatus,
): iTicketStatus[] {
  if (isAllStatusesSelected(current)) {
    return [status];
  }
  if (current.includes(status)) {
    const next = current.filter((s) => s !== status);
    return next.length === 0 ? [] : next;
  }
  return [...current, status];
}

/** Years from `TICKET_FILTER_YEAR_START` through the current year (newest first). */
export function getTicketFilterYearOptions(): TicketFilterDateOption[] {
  const end = new Date();
  const start = new Date(TICKET_FILTER_YEAR_START, 0, 1);
  return eachYearOfInterval({ start, end })
    .reverse()
    .map((date) => ({
      value: format(date, "yyyy"),
      label: format(date, "yyyy"),
    }));
}

/** All calendar months Jan–Dec for a valid filter year. */
export function getTicketFilterMonthOptions(
  year: string,
  locale: Locale = getDateFnsLocale(getAppLocale()),
): TicketFilterDateOption[] {
  const yearNum = Number(year);
  const now = new Date();
  if (
    Number.isNaN(yearNum) ||
    yearNum < TICKET_FILTER_YEAR_START ||
    yearNum > getYear(now)
  ) {
    return [];
  }

  const intervalStart = startOfYear(parse(year, "yyyy", new Date()));
  const intervalEnd = endOfYear(intervalStart);

  return eachMonthOfInterval({ start: intervalStart, end: intervalEnd }).map((date) => ({
    value: format(date, "MM"),
    label: format(date, "MMM", { locale }),
  }));
}

export type TicketFilterSummaryChip = { key: string; label: string };

/** Human-readable chips for the applied filter bar (always includes period + ward chips). */
export function buildTicketFilterSummary(
  filter: TicketFilterState,
  options?: { serviceLabel?: string; dateLocale?: Locale },
): TicketFilterSummaryChip[] {
  const monthLabel =
    getTicketFilterMonthOptions(filter.year, options?.dateLocale).find(
      (m) => m.value === filter.month,
    )?.label ?? filter.month;

  const chips: TicketFilterSummaryChip[] = [
    { key: "period", label: `${monthLabel} ${filter.year}` },
  ];

  if (filter.selectedServiceId) {
    chips.push({
      key: "service",
      label: options?.serviceLabel?.trim() || "Service",
    });
  }

  if (isAllStatusesSelected(filter.selectedStatuses)) {
    chips.push({ key: "statuses", label: "All statuses" });
  } else {
    for (const status of filter.selectedStatuses) {
      chips.push({ key: `status-${status}`, label: status });
    }
  }

  if (isAllWardsSelected(filter.selectedWards)) {
    chips.push({ key: "wards", label: "All wards" });
  } else {
    for (const ward of [...filter.selectedWards].sort((a, b) => a - b)) {
      chips.push({ key: `ward-${ward}`, label: `Ward ${ward}` });
    }
  }

  if (filter.query.trim()) {
    const q = filter.query.trim();
    chips.push({
      key: "search",
      label: q.length > 22 ? `${q.slice(0, 22)}…` : q,
    });
  }

  return chips;
}

/** Search params from `/(staff)/ticket-screen` (Expo Router values are strings). */
export type StaffTicketScreenSearchParams = {
  selectedServiceId?: string | string[];
  selectedStatuses?: string | string[];
  selectedWards?: string | string[];
  title?: string;
};

/** Route params from staff analytics / ward screens (`params` + `data` JSON strings). */
export type StaffTicketsRouteParams = StaffTicketScreenSearchParams & {
  params?: string | string[];
  data?: string | string[];
};

export type StaffTicketsRouteData = {
  title?: iLocalizedTitle;
  ticketsByWards?: { ward: number; tickets: number }[];
};

function firstSearchParam(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

/** Parses route params into ticket filter fields. */
export function parseStaffTicketScreenParams(
  raw: StaffTicketScreenSearchParams,
): Partial<TicketFilterState> {
  const out: Partial<TicketFilterState> = {};

  const serviceId = firstSearchParam(raw.selectedServiceId);
  if (serviceId) {
    out.selectedServiceId = serviceId;
  }

  const statusesRaw = firstSearchParam(raw.selectedStatuses);
  if (statusesRaw) {
    const allowed = new Set(TICKET_FILTER_STATUSES);
    const statuses = statusesRaw
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter((s): s is iTicketStatus => allowed.has(s as iTicketStatus));
    if (statuses.length > 0) {
      out.selectedStatuses = statuses;
    }
  }

  const wardsRaw = firstSearchParam(raw.selectedWards);
  if (wardsRaw) {
    const wards = wardsRaw
      .split(",")
      .map((w) => Number(w.trim()))
      .filter((n) => Number.isInteger(n) && n > 0);
    if (wards.length > 0) {
      out.selectedWards = wards;
    }
  }

  return out;
}

function parseStaffTicketsRouteData(
  raw: StaffTicketsRouteParams,
): StaffTicketsRouteData | undefined {
  const dataJson = firstSearchParam(raw.data);
  if (!dataJson) return undefined;
  try {
    return JSON.parse(dataJson) as StaffTicketsRouteData;
  } catch {
    return undefined;
  }
}

/** Parses route params from analytics/ward screens or legacy flat search params. */
export function parseStaffTicketsRouteParams(raw: StaffTicketsRouteParams): {
  filterPatch: Partial<TicketFilterState>;
  data?: StaffTicketsRouteData;
} {
  const paramsJson = firstSearchParam(raw.params);
  if (paramsJson) {
    try {
      const parsed = JSON.parse(paramsJson) as StaffTicketScreenSearchParams;
      return {
        filterPatch: parseStaffTicketScreenParams(parsed),
        data: parseStaffTicketsRouteData(raw),
      };
    } catch {
      // Fall through to legacy flat params.
    }
  }

  return {
    filterPatch: parseStaffTicketScreenParams(raw),
    data: parseStaffTicketsRouteData(raw),
  };
}

/** Serializes filter fields for `router.push` (comma-separated lists). */
export function buildStaffTicketScreenParams(
  filter: Pick<
    TicketFilterState,
    "selectedServiceId" | "selectedStatuses" | "selectedWards"
  >,
): Record<string, string> {
  const params: Record<string, string> = {};
  if (filter.selectedServiceId) {
    params.selectedServiceId = filter.selectedServiceId;
  }
  if (filter.selectedStatuses.length > 0) {
    params.selectedStatuses = filter.selectedStatuses.join(",");
  }
  if (filter.selectedWards.length > 0) {
    params.selectedWards = filter.selectedWards.join(",");
  }
  return params;
}

/** Builds `params` + `data` route payload for `staff-tickets-screen`. */
export function buildStaffTicketsScreenRouteParams(
  routeParams: StaffTicketsRouteParams,
  options?: { ward?: number },
): { params: string; data: string } {
  const paramsJson = firstSearchParam(routeParams.params) ?? "{}";
  let filterParams: Record<string, string> = {};
  try {
    filterParams = JSON.parse(paramsJson) as Record<string, string>;
  } catch {
    filterParams = {};
  }

  if (options?.ward !== undefined) {
    filterParams.selectedWards = String(options.ward);
  }

  return {
    params: JSON.stringify(filterParams),
    data: firstSearchParam(routeParams.data) ?? "",
  };
}

export function countActiveTicketFilters(filter: TicketFilterState): number {
  const defaults = createDefaultTicketFilter();
  let count = 0;
  if (filter.query.trim()) count++;
  if (filter.selectedServiceId) count++;
  if (filter.selectedStatuses.length > 0) count++;
  if (filter.selectedWards.length > 0) count++;
  if (filter.month !== defaults.month || filter.year !== defaults.year) count++;
  return count;
}

export function useTicketFilter(): TicketFilterSelection {
  const [filter, setFilter] = useState<TicketFilterState>(createDefaultTicketFilter);

  const handleFilter = useCallback((changes: Partial<TicketFilterState>) => {
    setFilter((prev) => ({ ...prev, ...changes }));
  }, []);

  const replaceFilter = useCallback((next: TicketFilterState) => {
    setFilter(next);
  }, []);

  const resetFilter = useCallback(() => {
    setFilter(createDefaultTicketFilter());
  }, []);

  return { filter, handleFilter, replaceFilter, resetFilter };
}
