import {
  Ban,
  BrushCleaningIcon,
  Building2,
  CheckCircle2,
  Columns4Icon,
  DropletIcon,
  FolderOpen,
  LayoutList,
  PawPrintIcon,
  UtilityPoleIcon,
  XCircle,
  type LucideIcon,
} from "lucide-react-native";
import { Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";

import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useStaffAuth } from "@/components/provider/staff-auth-provider";
import { useStaffHomeAnalyticsQuery } from "@/features/tickets/hooks/use-staff-home-analytics-query";
import { buildStaffTicketScreenParams } from "@/features/tickets/hooks/use-tickets-filter";
import { useRouter } from "expo-router";
import { bookingRoutes } from "@/features/bookings/lib/booking-routes";
import type { iTicketStatus } from "@/features/tickets/types";
import { Separator } from "@/components/ui/separator";

type ComplaintTheme = {
  icon: LucideIcon;
  containerClass: string;
  iconColor: string;
};

const complaintThemes: Record<string, ComplaintTheme> = {
  Enforcement: {
    icon: Columns4Icon,
    containerClass: "border-violet-200 bg-violet-100",
    iconColor: "#7C3AED",
  },
  Swachhata: {
    icon: BrushCleaningIcon,
    containerClass: "border-emerald-200 bg-emerald-100",
    iconColor: "#059669",
  },
  Water: {
    icon: DropletIcon,
    containerClass: "border-sky-200 bg-sky-100",
    iconColor: "#0284C7",
  },
  "Pet Control": {
    icon: PawPrintIcon,
    containerClass: "border-amber-200 bg-amber-100",
    iconColor: "#D97706",
  },
  Electricity: {
    icon: UtilityPoleIcon,
    containerClass: "border-orange-200 bg-orange-100",
    iconColor: "#EA580C",
  },
};

const defaultTheme: ComplaintTheme = {
  icon: Columns4Icon,
  containerClass: "border-primary/30 bg-primary/15",
  iconColor: "#0EA5E9",
};

type StatCardVariant = "total" | "open" | "completed" | "blocked" | "cancelled";

const statCardThemes: Record<
  StatCardVariant,
  { card: string; label: string; value: string; iconWrap: string; iconColor: string }
> = {
  total: {
    card: "border-violet-200 bg-violet-50",
    label: "text-violet-800",
    value: "text-violet-950",
    iconWrap: "bg-violet-200/90",
    iconColor: "#6D28D9",
  },
  open: {
    card: "border-sky-200 bg-sky-50",
    label: "text-sky-800",
    value: "text-sky-950",
    iconWrap: "bg-sky-200/90",
    iconColor: "#0369A1",
  },
  completed: {
    card: "border-emerald-200 bg-emerald-50",
    label: "text-emerald-800",
    value: "text-emerald-950",
    iconWrap: "bg-emerald-200/90",
    iconColor: "#047857",
  },
  blocked: {
    card: "border-amber-200 bg-amber-50",
    label: "text-amber-900",
    value: "text-amber-950",
    iconWrap: "bg-amber-200/90",
    iconColor: "#B45309",
  },
  cancelled: {
    card: "border-rose-200 bg-rose-50",
    label: "text-rose-800",
    value: "text-rose-950",
    iconWrap: "bg-rose-200/90",
    iconColor: "#BE123C",
  },
};

const bookingResourceTheme = {
  containerClass: "border-teal-200 bg-teal-100",
  iconColor: "#0D9488",
};

type StatCardProps = {
  label: string;
  value: number;
  icon: LucideIcon;
  variant: StatCardVariant;
};

function StatCard({ label, value, icon: Icon, variant }: StatCardProps) {
  const theme = statCardThemes[variant];
  return (
    <View
      className={cn(
        "min-h-[75px] flex-1 rounded-2xl border p-3 shadow-sm",
        theme.card,
      )}>
      <View className="flex-row items-start justify-between">
        <Text className={cn("text-xs font-semibold", theme.label)}>{label}</Text>
        <View
          className={cn(
            "h-8 w-8 items-center justify-center rounded-lg",
            theme.iconWrap,
          )}>
          <Icon size={16} color={theme.iconColor} />
        </View>
      </View>
      <Text className={cn("text-2xl font-bold tabular-nums", theme.value)}>
        {value}
      </Text>
    </View>
  );
}

function StaffHomeDashboardSkeleton() {
  return (
    <View className="gap-6 px-4 pb-6 pt-2">
      <Skeleton className="h-8 w-48" />
      <View className="flex-row gap-3">
        {new Array(3).fill(0).map((_, index) => (
          <Skeleton key={`tickets-${index}`} className="h-[75px] flex-1 rounded-2xl" />
        ))}
      </View>
      <Skeleton className="h-6 w-32" />
      <View className="-mx-1 flex-row flex-wrap">
        {new Array(6).fill(0).map((_, index) => (
          <View key={`complaints-${index}`} className="mb-3 w-1/3 px-1">
            <Skeleton className="h-[100px] w-full rounded-2xl" />
          </View>
        ))}
      </View>
      <Skeleton className="h-8 w-52" />
      <View className="flex-row flex-wrap gap-3">
        {new Array(4).fill(0).map((_, index) => (
          <Skeleton key={`bookings-${index}`} className="h-[75px] w-[47%] rounded-2xl" />
        ))}
      </View>
      <Skeleton className="h-6 w-40" />
      <View className="-mx-1 flex-row flex-wrap">
        {new Array(3).fill(0).map((_, index) => (
          <View key={`resources-${index}`} className="mb-3 w-1/3 px-1">
            <Skeleton className="h-[100px] w-full rounded-2xl" />
          </View>
        ))}
      </View>
    </View>
  );
}

export function StaffHomeDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const { staffInfo } = useStaffAuth();

  const { data: analytics, isLoading, isError, error } = useStaffHomeAnalyticsQuery({
    wards: staffInfo?.wards ?? [],
  });

  if (isLoading) {
    return <StaffHomeDashboardSkeleton />;
  }

  if (isError && !analytics) {
    return (
      <View className="mb-56 px-4 pb-6 pt-2">
        <Text className="text-destructive text-sm">
          {error?.message ?? t("tickets.dashboardLoadError")}
        </Text>
      </View>
    );
  }

  const tickets = analytics?.complaintTickets;
  const complaints = analytics?.complaint ?? [];
  const bookingSummary = analytics?.bookingSummary;
  const bookingResources = analytics?.bookingResources ?? [];

  const handleComplaintPress = (complaintId: string) => {
    const openStatuses: iTicketStatus[] = [
      "TODO",
      "IN_PROGRESS",
      "BLOCKED",
      "REOPENED",
    ];
    router.push({
      pathname: "/staff/staff-tickets-screen",
      params: buildStaffTicketScreenParams({
        selectedComplaintId: complaintId,
        selectedStatuses: openStatuses,
        selectedWards: staffInfo?.wards ?? [],
      }),
    });
  };

  return (
    <View className="mb-56 gap-6 pb-6 pt-2">
      <View className="px-4 gap-6">
        {tickets ? (
          <>
            <Text className="text-foreground text-2xl font-bold">
              {t("tickets.totalTicketsTitle", { total: tickets.total })}
            </Text>
            <View className="flex-row gap-3">
              <StatCard label={t("tickets.open")} value={tickets.open} icon={FolderOpen} variant="open" />
              <StatCard
                label={t("tickets.done")}
                value={tickets.completed}
                icon={CheckCircle2}
                variant="completed"
              />
              <StatCard label={t("tickets.blocked")} value={tickets.blocked} icon={Ban} variant="blocked" />
            </View>
          </>
        ) : (
          <Text className="text-muted-foreground text-sm">{t("tickets.noData")}</Text>
        )}
        <View className="gap-3">
          <Text className="text-foreground text-xl font-bold">{t("complaints.title")}</Text>
          {complaints.length === 0 ? (
            <Text className="text-muted-foreground text-sm">{t("tickets.noComplaintTypes")}</Text>
          ) : (
            <View className="-mx-1 flex-row flex-wrap">
              {complaints.map((item) => {
                const theme = complaintThemes[item.title] ?? defaultTheme;
                const Icon = theme.icon;
                return (
                  <Pressable
                    key={item.id}
                    className="mb-3 w-1/3 px-1"
                    onPress={() => handleComplaintPress(item.id)}
                  >
                    <View className="rounded-2xl border border-border bg-card p-3 shadow-sm">
                      <View
                        className={cn(
                          "mb-2 h-12 w-12 items-center justify-center self-center rounded-full border",
                          theme.containerClass,
                        )}>
                        <Icon size={22} color={theme.iconColor} />
                      </View>
                      <Text
                        className="mb-1 text-center text-xs font-semibold text-foreground"
                        numberOfLines={2}>
                        {item.title}
                      </Text>
                      <View
                        className="self-center rounded-lg px-2 py-1"
                        style={{ backgroundColor: `${theme.iconColor}24` }}>
                        <Text
                          className="text-center text-[11px] font-bold tabular-nums"
                          style={{ color: theme.iconColor }}
                          numberOfLines={1}>
                          {t("tickets.openTicketsCount", { count: item.open })}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </View>

      <Separator />

      <View className="px-4 gap-6">
        {bookingSummary ? (
          <>
            <Text className="text-foreground text-2xl font-bold">
              {t("bookings.staffTotalBookingsTitle", { total: bookingSummary.total })}
            </Text>
            <View className="flex-row flex-wrap gap-3">
              <View className="w-[47%]">
                <StatCard
                  label={t("bookings.staffTotal")}
                  value={bookingSummary.total}
                  icon={LayoutList}
                  variant="total"
                />
              </View>
              <View className="w-[47%]">
                <StatCard
                  label={t("tickets.open")}
                  value={bookingSummary.open}
                  icon={FolderOpen}
                  variant="open"
                />
              </View>
              <View className="w-[47%]">
                <StatCard
                  label={t("tickets.done")}
                  value={bookingSummary.completed}
                  icon={CheckCircle2}
                  variant="completed"
                />
              </View>
              <View className="w-[47%]">
                <StatCard
                  label={t("bookings.cancelled")}
                  value={bookingSummary.cancelled}
                  icon={XCircle}
                  variant="cancelled"
                />
              </View>
            </View>
            <View className="gap-3">
              <Text className="text-foreground text-xl font-bold">
                {t("bookings.staffResourcesTitle")}
              </Text>
              {bookingResources.length === 0 ? (
                <Text className="text-muted-foreground text-sm">{t("bookings.emptyTitle")}</Text>
              ) : (
                <View className="-mx-1 flex-row flex-wrap">
                  {bookingResources.map((item) => (
                    <Pressable
                      key={item.id}
                      className="mb-3 w-1/3 px-1"
                      onPress={() => {
                        router.push(
                          bookingRoutes.staffBookingsList(item.id) as never,
                        );
                      }}
                    >
                      <View className="rounded-2xl border border-border bg-card p-3 shadow-sm">
                        <View
                          className={cn(
                            "mb-2 h-12 w-12 items-center justify-center self-center rounded-full border",
                            bookingResourceTheme.containerClass,
                          )}>
                          <Building2 size={22} color={bookingResourceTheme.iconColor} />
                        </View>
                        <Text
                          className="mb-1 text-center text-xs font-semibold text-foreground"
                          numberOfLines={2}>
                          {item.title}
                        </Text>
                        <View
                          className="self-center rounded-lg px-2 py-1"
                          style={{ backgroundColor: `${bookingResourceTheme.iconColor}24` }}>
                          <Text
                            className="text-center text-[11px] font-bold tabular-nums"
                            style={{ color: bookingResourceTheme.iconColor }}
                            numberOfLines={1}>
                            {t("bookings.staffOpenBookingsCount", { count: item.open })}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </>
        ) : null}
      </View>
    </View>
  );
}
