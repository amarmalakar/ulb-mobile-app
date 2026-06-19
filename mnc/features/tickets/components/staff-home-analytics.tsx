import { useStaffAuth } from "@/components/providers/staff-auth-provider";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useStaffHomeAnalyticsQuery } from "../hooks/use-staff-home-analytics-query";
import { Pressable, View } from "react-native";
import { Typography } from "@/components/common/typography";
import { buildStaffTicketScreenParams } from "../hooks/use-tickets-filter";
import { iTicketStatus } from "../types";
import { cn } from "@/lib/utils";
import { getLocaleString } from "@/lib/i18n/get-locale-string";
import { resolveTicketImageUrl } from "@/lib/resolve-ticket-image-url";
import { Image } from "expo-image";
import { StaffHomeAnalyticsBookingResourceBreakdown, StaffHomeAnalyticsServiceBreakdown } from "../types/staff-home-analytics";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { AlertCircleIcon, BarChart3Icon, RefreshCcwIcon } from "lucide-react-native";

function ServiceAnalyticsCard({
  service,
  onPress,
}: {
  service: StaffHomeAnalyticsServiceBreakdown;
  onPress: () => void;
}) {
  const iconImageUrl = service.iconPathname
    ? resolveTicketImageUrl(service.iconPathname)
    : "";

  const color = "sky";

  return (
    <Pressable className="mb-3 w-1/3 px-1 active:opacity-80 h-[100px]" onPress={onPress}>
      <View
        className={cn(
          "relative h-[100px] rounded-2xl border p-3 shadow-sm",
          `border-${color}-200 bg-${color}-50`,
        )}
      >
        <Typography
          className={cn(
            "max-w-[70%] text-xs font-semibold leading-tight",
            `text-${color}-800`,
          )}
          numberOfLines={2}
        >
          {getLocaleString(service.title)}
        </Typography>

        <Typography
          variant="h3"
          className={cn(`text-${color}-800 mt-3`)}
        >
          {service.open}
        </Typography>

        {iconImageUrl ? (
          <Image
            source={{ uri: iconImageUrl }}
            style={{
              position: "absolute",
              bottom: 0,
              right: 2,
              width: 50,
              height: 50,
            }}
            contentFit="contain"
            accessibilityLabel={getLocaleString(service.title)}
          />
        ) : null}
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
  const iconImageUrl = resource.featuredImageUrl
    ? resolveTicketImageUrl(resource.featuredImageUrl)
    : "";

  const color = "emerald";

  return (
    <Pressable className="mb-3 w-1/3 px-1 active:opacity-80 h-[100px]" onPress={onPress}>
      <View
        className={cn(
          "relative h-[100px] rounded-2xl border p-3 shadow-sm",
          `border-${color}-200 bg-${color}-50`,
        )}
      >
        <Typography
          className={cn(
            "max-w-[70%] text-xs font-semibold leading-tight",
            `text-${color}-800`,
          )}
          numberOfLines={2}
        >
          {resource.title}
        </Typography>

        <Typography
          variant="h3"
          className={cn(`text-${color}-800 mt-3`)}
        >
          {resource.open}
        </Typography>

        {iconImageUrl ? (
          <Image
            source={{ uri: iconImageUrl }}
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 60,
              height: 50,
              borderBottomRightRadius: 10,
            }}
            contentFit="cover"
            accessibilityLabel={resource.title}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

function StaffHomeAnalyticsSkeleton() {
  return (
    <View className="gap-6">
      <Separator />
      <View className="gap-6 px-4">
        <Skeleton className="h-6 w-32" />
        <View className="-mx-1 flex-row flex-wrap">
          {new Array(6).fill(0).map((_, index) => (
            <View key={`services-${index}`} className="mb-3 w-1/3 px-1">
              <Skeleton className="h-[100px] w-full rounded-2xl" />
            </View>
          ))}
        </View>
      </View>
      <Separator />
      <View className="gap-6 px-4">
        <Skeleton className="h-6 w-40" />
        <View className="-mx-1 flex-row flex-wrap">
          {new Array(3).fill(0).map((_, index) => (
            <View key={`resources-${index}`} className="mb-3 w-1/3 px-1">
              <Skeleton className="h-[100px] w-full rounded-2xl" />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function StaffHomeAnalyticsError({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  const { t } = useTranslation();

  return (
    <View className="gap-6">
      <Separator />
      <View className="px-4">
        <View className="items-center gap-4 rounded-2xl border border-border bg-card px-4 py-8">
          <View className="bg-destructive/10 size-16 items-center justify-center rounded-full">
            <Icon as={AlertCircleIcon} className="text-destructive" size={32} />
          </View>
          <View className="gap-1.5">
            <Typography className="text-destructive text-center text-base font-bold">
              {t("common.errorTitle")}
            </Typography>
            <Typography className="text-muted-foreground text-center text-sm">
              {message ?? t("tickets.dashboardLoadError")}
            </Typography>
          </View>
          {onRetry ? (
            <Button size="sm" variant="outline" onPress={onRetry}>
              <Icon as={RefreshCcwIcon} className="size-4" />
              <Typography>{t("common.retry")}</Typography>
            </Button>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function StaffHomeAnalyticsEmpty() {
  const { t } = useTranslation();

  return (
    <View className="gap-6">
      <Separator />
      <View className="px-4">
        <View className="items-center gap-4 rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-8">
          <View className="size-16 items-center justify-center rounded-full bg-muted">
            <Icon as={BarChart3Icon} className="text-muted-foreground" size={32} />
          </View>
          <View className="gap-1.5">
            <Typography className="text-center text-base font-bold text-foreground">
              {t("tickets.analyticsEmptyTitle")}
            </Typography>
            <Typography className="text-muted-foreground max-w-[280px] text-center text-sm leading-relaxed">
              {t("tickets.analyticsEmptyHint")}
            </Typography>
          </View>
        </View>
      </View>
    </View>
  );
}

export function StaffHomeAnalytics() {
  const { t } = useTranslation();
  const router = useRouter();

  const { sessionHydrated, staffInfo } = useStaffAuth();

  const { data: analytics, isLoading, isError, error, refetch } = useStaffHomeAnalyticsQuery(
    { wards: staffInfo?.wards ?? [] },
    { enabled: Boolean(sessionHydrated) },
  );

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

  if (isLoading) {
    return <StaffHomeAnalyticsSkeleton />;
  }

  if (isError && !analytics) {
    return (
      <StaffHomeAnalyticsError
        message={error?.message}
        onRetry={() => void refetch()}
      />
    );
  }

  const services = analytics?.services ?? [];
  const bookingSummary = analytics?.bookingSummary;
  const bookingResources = analytics?.bookingResources ?? [];

  if (services.length === 0 && !bookingSummary) {
    return <StaffHomeAnalyticsEmpty />;
  }

  return (
    <View className="gap-6">

      <Separator />

      <View className="gap-6 px-4">
        {/* <Text>Staff Home Analytics</Text> */}
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
          </>
        ) : null}
      </View>
    </View>
  );
}