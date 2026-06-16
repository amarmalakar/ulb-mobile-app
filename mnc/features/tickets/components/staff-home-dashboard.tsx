import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { Typography } from "@/components/common/typography";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { useStaffHomeAnalyticsQuery } from "../hooks/use-staff-home-analytics-query";
import { useStaffAuth } from "@/components/providers/staff-auth-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { iTicketStatus } from "../types";
import { buildStaffTicketScreenParams } from "../hooks/use-tickets-filter";
import { cn } from "@/lib/utils";
import { BanIcon, Building2Icon, CheckCircle2, FolderOpen, LayoutListIcon, LucideIcon, XCircleIcon } from "lucide-react-native";
import { getServiceColorClass } from "@/lib/get-service-color-class";
import { getLocaleString } from "@/lib/i18n/get-locale-string";
import { resolveServiceIcon } from "@/features/service/lib/resolve-service-icon";
import { Icon } from "@/components/ui/icon";
import type { StaffHomeAnalyticsServiceBreakdown, StaffHomeAnalyticsBookingResourceBreakdown } from "../types/staff-home-analytics";
import { Separator } from "@/components/ui/separator";
import { resolveTicketImageUrl } from "@/lib/resolve-ticket-image-url";

type StatCardVariant = "total" | "open" | "completed" | "blocked" | "cancelled";

type StatCardProps = {
  label: string;
  value: number;
  icon: LucideIcon;
  variant: StatCardVariant;
};

const bookingResourceTheme = {
  containerClass: "border-teal-200 bg-teal-100",
  iconColor: "#0D9488",
};

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

function StatCard({ label, value, icon: Icon, variant }: StatCardProps) {
  const theme = statCardThemes[variant];
  return (
    <View
      className={cn(
        "min-h-[75px] flex-1 rounded-2xl border p-3 shadow-sm",
        theme.card,
      )}>
      <View className="flex-row items-start justify-between">
        <Typography className={cn("text-xs font-semibold", theme.label)}>{label}</Typography>
        <View
          className={cn(
            "h-8 w-8 items-center justify-center rounded-lg",
            theme.iconWrap,
          )}>
          <Icon size={16} color={theme.iconColor} />
        </View>
      </View>
      <Typography className={cn("text-2xl font-bold tabular-nums", theme.value)}>
        {value}
      </Typography>
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
          <View key={`services-${index}`} className="mb-3 w-1/3 px-1">
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

function ServiceAnalyticsCard({
  service,
  onPress,
}: {
  service: StaffHomeAnalyticsServiceBreakdown;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const ServiceIcon = resolveServiceIcon(service.icon);

  return (
    <Pressable className="mb-3 w-1/3 px-1" onPress={onPress}>
      <View className="rounded-2xl border border-border bg-card p-3 shadow-sm">
        <View
          className={cn(
            "mb-2 h-12 w-12 items-center justify-center self-center rounded-full border",
            getServiceColorClass("border", service.color, 200),
            getServiceColorClass("bg", service.color, 100),
          )}
        >
          <Icon
            as={ServiceIcon}
            className={getServiceColorClass("text", service.color, 600)}
            size={22}
          />
        </View>
        <Typography
          className="mb-1 text-center text-xs font-semibold text-foreground"
          numberOfLines={2}
        >
          {getLocaleString(service.title)}
        </Typography>
        <View
          className={cn(
            "self-center rounded-lg px-2 py-1",
            getServiceColorClass("bg", service.color, 100),
          )}
        >
          <Typography
            className={cn(
              "text-center text-[11px] font-bold tabular-nums",
              getServiceColorClass("text", service.color, 700),
            )}
            numberOfLines={1}
          >
            {t("tickets.openTicketsCount", { count: service.open })}
          </Typography>
        </View>
      </View>
    </Pressable>
  );
}

function BookingResourceAnalyticsCard({
  resource,
  onPress,
}: {
  resource: StaffHomeAnalyticsBookingResourceBreakdown;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const featuredImageUri = resource.featuredImageUrl
    ? resolveTicketImageUrl(resource.featuredImageUrl)
    : null;

  return (
    <Pressable className="mb-3 w-1/3 px-1" onPress={onPress}>
      <View className="rounded-2xl border border-border bg-card p-3 shadow-sm">
        <View
          className={cn(
            "mb-2 h-12 w-12 self-center overflow-hidden rounded-full border",
            featuredImageUri ? "border-border bg-muted" : bookingResourceTheme.containerClass,
          )}
        >
          {featuredImageUri ? (
            <Image
              source={{ uri: featuredImageUri }}
              style={{ width: 48, height: 48 }}
              contentFit="cover"
            />
          ) : (
            <View className="h-full w-full items-center justify-center">
              <Building2Icon size={22} color={bookingResourceTheme.iconColor} />
            </View>
          )}
        </View>
        <Typography
          className="mb-1 text-center text-xs font-semibold text-foreground"
          numberOfLines={2}
        >
          {resource.title}
        </Typography>
        <View
          className="self-center rounded-lg px-2 py-1"
          style={{ backgroundColor: `${bookingResourceTheme.iconColor}24` }}
        >
          <Typography
            className="text-center text-[11px] font-bold tabular-nums"
            style={{ color: bookingResourceTheme.iconColor }}
            numberOfLines={1}
          >
            {t("bookings.staffOpenBookingsCount", { count: resource.open })}
          </Typography>
        </View>
      </View>
    </Pressable>
  );
}

export function StaffHomeDashboard() {
  const { t } = useTranslation();
  const router = useRouter();

  const { sessionHydrated, staffInfo } = useStaffAuth();

  const { data: analytics, isLoading, isError, error } = useStaffHomeAnalyticsQuery(
    { wards: staffInfo?.wards ?? [] },
    { enabled: Boolean(sessionHydrated) },
  );

  if (isLoading) {
    return <StaffHomeDashboardSkeleton />;
  }

  if (isError && !analytics) {
    return (
      <View className="px-4 pb-6 pt-2">
        <Typography className="text-destructive text-sm">
          {error?.message ?? t("tickets.dashboardLoadError")}
        </Typography>
      </View>
    );
  }

  const tickets = analytics?.serviceTickets;
  const services = analytics?.services ?? [];
  const bookingSummary = analytics?.bookingSummary;
  const bookingResources = analytics?.bookingResources ?? [];

  const handleServicePress = (serviceId: string) => {
    const openStatuses: iTicketStatus[] = [
      "TODO",
      "IN_PROGRESS",
      "BLOCKED",
      "REOPENED",
    ];
    router.push({
      pathname: "/staff/staff-tickets-screen",
      params: buildStaffTicketScreenParams({
        selectedServiceId: serviceId,
        selectedStatuses: openStatuses,
        selectedWards: staffInfo?.wards ?? [],
      }),
    });
  };

  return (
    <View className="gap-6 pb-6 pt-2">
      <View className="px-4 gap-6">
        {tickets ? (
          <>
            <Typography variant="h4" className="text-primary">
              {t("tickets.totalTicketsTitle", { total: tickets.total })}
            </Typography>
            <View className="flex-row gap-3">
              <StatCard label={t("tickets.open")} value={tickets.open} icon={FolderOpen} variant="open" />
              <StatCard
                label={t("tickets.done")}
                value={tickets.completed}
                icon={CheckCircle2}
                variant="completed"
              />
              <StatCard label={t("tickets.blocked")} value={tickets.blocked} icon={BanIcon} variant="blocked" />
            </View>
          </>
        ) : (
          <Typography className="text-muted-foreground text-sm">{t("tickets.noData")}</Typography>
        )}

        <View className="gap-3">
          <Typography variant="h4" className="text-primary">{t("services.title")}</Typography>

          {services.length === 0 ? (
            <Typography className="text-muted-foreground text-sm">{t("services.empty")}</Typography>
          ) : (
            <View className="-mx-1 flex-row flex-wrap">
              {services.map((item) => (
                <ServiceAnalyticsCard
                  key={item.id}
                  service={item}
                  onPress={() => handleServicePress(item.id)}
                />
              ))}
            </View>
          )}
        </View>
      </View>

      <Separator />

      <View className="px-4 gap-6">
        {bookingSummary ? (
          <>
            <Typography variant="h4" className="text-primary">
              {t("bookings.staffTotalBookingsTitle", { total: bookingSummary.total })}
            </Typography>

            <View className="flex-row flex-wrap gap-3">
              <View className="w-[47%]">
                <StatCard
                  label={t("bookings.staffTotal")}
                  value={bookingSummary.total}
                  icon={LayoutListIcon}
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
                  icon={XCircleIcon}
                  variant="cancelled"
                />
              </View>
            </View>

            <View className="gap-3">
              <Typography variant="h4" className="text-primary">
                {t("bookings.staffResourcesTitle")}
              </Typography>

              {bookingResources.length === 0 ? (
                <Typography className="text-muted-foreground text-sm">{t("bookings.emptyTitle")}</Typography>
              ) : (
                <View className="-mx-1 flex-row flex-wrap">
                  {bookingResources.map((item) => (
                    <BookingResourceAnalyticsCard
                      key={item.id}
                      resource={item}
                      onPress={() => {
                        router.push({
                          pathname: '/staff/staff-bookings-screen',
                          params: { bookingResourceId: item.id },
                        });
                      }}
                    />
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