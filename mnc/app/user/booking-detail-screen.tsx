import { TopNavigation } from "@/components/common/top-navigation";
import { Typography } from "@/components/common/typography";
import { useUserAuth } from "@/components/providers/user-auth-provider";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useUserBookingQuery } from "@/features/bookings/hooks/use-user-booking-query";
import { firstParam } from "@/features/bookings/lib/route-params";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { AlertCircleIcon, Building2Icon, CalendarCheckIcon, CalendarRangeIcon, CarIcon, HashIcon, MapPinIcon, PhoneIcon, RefreshCcwIcon, UserIcon } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import { Skeleton } from "@/components/ui/skeleton";
import { Image } from "expo-image";
import { getBookingStatusConfig } from "@/features/bookings/lib/booking-status";
import { UserBookingByIdDetail } from "@/features/bookings/types";
import { resolveTicketImageUrl } from "@/lib/resolve-ticket-image-url";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { BookingTimeline } from "@/features/bookings/components/booking-timeline";

const THUMB_SIZE = 88;

export function UserBookingDetailLoader() {
  return (
    <View className="flex-1 gap-5 px-4 pb-10 pt-2">
      <View className="flex-row gap-3 rounded-2xl border border-border bg-card p-4">
        <Skeleton
          style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
          className="rounded-xl"
        />
        <View className="min-w-0 flex-1 gap-2">
          <Skeleton className="h-6 w-3/4 rounded-md" />
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-3 w-28 rounded-md" />
        </View>
      </View>

      <View className="rounded-2xl border border-border bg-card p-4">
        <Skeleton className="mb-3 h-4 w-32 rounded-md" />
        <View className="flex-row flex-wrap gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <View key={index} className="gap-1">
              <Skeleton className="h-3 w-16 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-md" />
            </View>
          ))}
        </View>
      </View>

      <View className="rounded-2xl border border-border bg-card p-4">
        <Skeleton className="mb-2 h-4 w-36 rounded-md" />
        {Array.from({ length: 4 }).map((_, index) => (
          <View key={index} className="flex-row items-start gap-2 py-1.5">
            <Skeleton className="mt-0.5 size-4 shrink-0 rounded-sm" />
            <View className="min-w-0 flex-1 gap-1">
              <Skeleton className="h-3 w-20 rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
            </View>
          </View>
        ))}
      </View>

      <Skeleton className="h-px w-full" />

      <View className="rounded-2xl border border-border bg-card p-4">
        <Skeleton className="mb-4 h-4 w-24 rounded-md" />
        {Array.from({ length: 3 }).map((_, index) => (
          <View key={index} className="mb-3 flex-row gap-3">
            <Skeleton className="size-8 rounded-full" />
            <View className="min-w-0 flex-1 gap-1.5">
              <Skeleton className="h-3 w-28 rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-3 w-2/3 rounded-md" />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export function UserBookingDetailError({
  message,
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center gap-4 p-4">
      <View className="bg-destructive/10 size-20 items-center justify-center rounded-full">
        <Icon as={AlertCircleIcon} className="text-destructive" size={40} />
      </View>
      <View className="gap-1.5">
        <Typography className="text-destructive text-center text-lg font-bold">
          {t('common.errorTitle')}
        </Typography>
        <Typography className="text-muted-foreground text-center text-sm">
          {message ?? t('bookings.yourBookingsLoadError')}
        </Typography>
      </View>
      <Button size="sm" variant="outline" onPress={onRetry}>
        <Icon as={RefreshCcwIcon} className="size-4" />
        <Typography>{t('common.retry')}</Typography>
      </Button>
    </View>
  );
}

export function UserBookingDetailEmpty() {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center gap-5 px-6 py-12">
      <View className="bg-muted size-20 items-center justify-center rounded-full">
        <Icon as={CalendarCheckIcon} className="text-muted-foreground" size={40} />
      </View>
      <View className="gap-1.5">
        <Typography className="text-foreground text-center text-xl font-bold">
          {t('bookings.bookingNotFound')}
        </Typography>
        <Typography className="text-muted-foreground max-w-[300px] text-center text-sm leading-relaxed">
          {t('bookings.bookingNotFoundHint')}
        </Typography>
      </View>
    </View>
  );
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount);
}

function DetailRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: typeof HashIcon;
}) {
  const RowIcon = icon;
  return (
    <View className="flex-row items-start gap-2 py-1.5">
      {RowIcon ? <Icon as={RowIcon} className="text-muted-foreground mt-0.5 size-4 shrink-0" /> : null}
      <View className="min-w-0 flex-1">
        <Typography className="text-muted-foreground text-xs">{label}</Typography>
        <Typography className="text-foreground text-sm font-medium">{value}</Typography>
      </View>
    </View>
  );
}

function UserBookingDetailContent({ booking }: { booking: UserBookingByIdDetail }) {
  const { t } = useTranslation();
  const router = useRouter();
  const statusConfig = getBookingStatusConfig(booking.status);
  const TypeIcon = booking.resource.type === 'VEHICLE' ? CarIcon : Building2Icon;
  const thumbnailUri = booking.resource.thumbnailUrl
    ? resolveTicketImageUrl(booking.resource.thumbnailUrl)
    : null;

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerClassName="gap-5 px-4 pb-10 pt-2"
    >
      <Pressable
        className="active:opacity-90"
        onPress={() => {
          router.push({
            pathname: '/user/booking-resource-info-screen',
            params: { resourceId: booking.resourceId },
          })
        }}
      >
        <View className="flex-row gap-3 rounded-2xl border border-border bg-card p-4">
          <View
            style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
            className="overflow-hidden rounded-xl bg-muted"
          >
            {thumbnailUri ? (
              <Image
                source={{ uri: thumbnailUri }}
                style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
                contentFit="cover"
              />
            ) : (
              <View className="h-full w-full items-center justify-center">
                <Icon as={TypeIcon} className="text-muted-foreground" size={32} />
              </View>
            )}
          </View>

          <View className="min-w-0 flex-1 gap-2">
            <Typography className="text-lg font-bold text-foreground" numberOfLines={2}>
              {booking.resource.name}
            </Typography>
            <Badge className={cn('self-start rounded-md px-2 py-0.5', statusConfig.badgeClass)}>
              <Typography className={cn('text-xs font-semibold', statusConfig.textClass)}>
                {t(statusConfig.labelKey)}
              </Typography>
            </Badge>
            <View className="flex-row items-center gap-1">
              <Icon as={HashIcon} className="text-muted-foreground size-3.5" />
              <Typography className="text-muted-foreground text-xs font-medium">
                {booking.bookingTokenId}
              </Typography>
            </View>
          </View>
        </View>
      </Pressable>

      <View className="rounded-2xl border border-border bg-card p-4">
        <Typography className="text-primary mb-3 text-sm font-semibold uppercase tracking-wide">
          {t('bookings.amountSummary')}
        </Typography>
        <View className="flex-row flex-wrap gap-4">
          <View>
            <Typography className="text-muted-foreground text-xs">{t('bookings.totalAmountLabel')}</Typography>
            <Typography className="text-foreground text-lg font-bold">
              ₹{formatAmount(booking.totalAmount)}
            </Typography>
          </View>
          <View>
            <Typography className="text-muted-foreground text-xs">{t('bookings.paidAmountLabel')}</Typography>
            <Typography className="text-emerald-600 text-lg font-bold">
              ₹{formatAmount(booking.paidAmount)}
            </Typography>
          </View>
          <View>
            <Typography className="text-muted-foreground text-xs">{t('bookings.balanceLabel')}</Typography>
            <Typography className="text-primary text-lg font-bold">
              ₹{formatAmount(booking.balance)}
            </Typography>
          </View>
        </View>
      </View>

      <View className="rounded-2xl border border-border bg-card p-4">
        <Typography className="text-primary mb-2 text-sm font-semibold uppercase tracking-wide">
          {t('bookings.bookingInfo')}
        </Typography>
        <DetailRow
          icon={CalendarRangeIcon}
          label={t('bookings.dateRange')}
          value={`${format(parseISO(booking.startsAt), 'dd MMM yyyy')} – ${format(parseISO(booking.endsAt), 'dd MMM yyyy')}`}
        />
        {booking.contactName ? (
          <DetailRow icon={UserIcon} label={t('bookings.contactName')} value={booking.contactName} />
        ) : null}
        {booking.contactPhone ? (
          <DetailRow icon={PhoneIcon} label={t('bookings.contactPhone')} value={booking.contactPhone} />
        ) : null}
        {booking.resource.locationAddress ? (
          <DetailRow
            icon={MapPinIcon}
            label={t('bookings.location')}
            value={booking.resource.locationAddress}
          />
        ) : null}
        {booking.purpose ? (
          <DetailRow label={t('bookings.purpose')} value={booking.purpose} />
        ) : null}
        {booking.guestCount != null ? (
          <DetailRow
            label={t('bookings.guestCount')}
            value={String(booking.guestCount)}
          />
        ) : null}
        {booking.notes ? (
          <DetailRow label={t('bookings.notes')} value={booking.notes} />
        ) : null}
      </View>

      <Separator />

      <View className="rounded-2xl border border-border bg-card p-4">
        <BookingTimeline history={booking.history} payments={booking.payments} />
      </View>

      <View className="h-16" />
    </ScrollView>
  );
}

export default function BookingDetailScreen() {
  const { t } = useTranslation();
  const { bookingId } = useLocalSearchParams<{ bookingId?: string | string[] }>();
  const id = firstParam(bookingId);

  const { sessionHydrated: userHydrated, mpinUnlocked: userMpin } = useUserAuth();

  const { data: booking, isLoading, isError, error, refetch } = useUserBookingQuery({
    bookingId: id,
    enabled: userHydrated && userMpin,
  })

  const navLabel = booking?.bookingTokenId ?? t('bookings.bookingDetailTitle');

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-background">
        <TopNavigation label={navLabel} isBackButton />
        {isLoading ? (
          <UserBookingDetailLoader />
        ) : isError ? (
          <UserBookingDetailError message={error?.message} onRetry={() => void refetch()} />
        ) : !booking ? (
          <UserBookingDetailEmpty />
        ) : (
          <UserBookingDetailContent booking={booking} />
        )}
      </View>
    </>
  );
}