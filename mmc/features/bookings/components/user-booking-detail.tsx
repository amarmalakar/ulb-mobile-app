import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { bookingRoutes } from '@/features/bookings/lib/booking-routes';
import { format, parseISO } from 'date-fns';
import {
  AlertCircleIcon,
  Building2Icon,
  CalendarRangeIcon,
  CarIcon,
  HashIcon,
  MapPinIcon,
  PhoneIcon,
  RefreshCcwIcon,
  UserIcon,
} from 'lucide-react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import type { UseQueryResult } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BookingTimeline } from '@/features/bookings/components/booking-timeline';
import type { UserBookingByIdDetail } from '@/features/bookings/types';
import { getBookingStatusConfig } from '@/features/bookings/lib/booking-status';
import { resolveTicketImageUrl } from '@/features/ticket-info/lib/resolve-ticket-image-url';
import { cn } from '@/lib/utils';

const THUMB_SIZE = 88;

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
        <Text className="text-muted-foreground text-xs">{label}</Text>
        <Text className="text-foreground text-sm font-medium">{value}</Text>
      </View>
    </View>
  );
}

function UserBookingDetailError({
  message,
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center gap-4 px-6 py-12">
      <View className="bg-destructive/10 size-20 items-center justify-center rounded-full">
        <Icon as={AlertCircleIcon} className="text-destructive" size={40} />
      </View>
      <Text className="text-destructive text-center text-lg font-bold">
        {t('common.errorTitle')}
      </Text>
      <Text className="text-muted-foreground text-center text-sm">
        {message ?? t('bookings.bookingDetailLoadError')}
      </Text>
      <Button size="sm" variant="outline" onPress={onRetry}>
        <Icon as={RefreshCcwIcon} className="size-4" />
        <Text>{t('common.retry')}</Text>
      </Button>
    </View>
  );
}

function BookingDetailContent({ booking }: { booking: UserBookingByIdDetail }) {
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
          router.push(bookingRoutes.resourceInfo(booking.resourceId) as never);
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
            <Text className="text-lg font-bold text-foreground" numberOfLines={2}>
              {booking.resource.name}
            </Text>
            <Badge className={cn('self-start rounded-md px-2 py-0.5', statusConfig.badgeClass)}>
              <Text className={cn('text-xs font-semibold', statusConfig.textClass)}>
                {t(statusConfig.labelKey)}
              </Text>
            </Badge>
            <View className="flex-row items-center gap-1">
              <Icon as={HashIcon} className="text-muted-foreground size-3.5" />
              <Text className="text-muted-foreground text-xs font-medium">
                {booking.bookingTokenId}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>

      <View className="rounded-2xl border border-border bg-card p-4">
        <Text className="text-primary mb-3 text-sm font-semibold uppercase tracking-wide">
          {t('bookings.amountSummary')}
        </Text>
        <View className="flex-row flex-wrap gap-4">
          <View>
            <Text className="text-muted-foreground text-xs">{t('bookings.totalAmountLabel')}</Text>
            <Text className="text-foreground text-lg font-bold">
              ₹{formatAmount(booking.totalAmount)}
            </Text>
          </View>
          <View>
            <Text className="text-muted-foreground text-xs">{t('bookings.paidAmountLabel')}</Text>
            <Text className="text-emerald-600 text-lg font-bold">
              ₹{formatAmount(booking.paidAmount)}
            </Text>
          </View>
          <View>
            <Text className="text-muted-foreground text-xs">{t('bookings.balanceLabel')}</Text>
            <Text className="text-primary text-lg font-bold">
              ₹{formatAmount(booking.balance)}
            </Text>
          </View>
        </View>
      </View>

      <View className="rounded-2xl border border-border bg-card p-4">
        <Text className="text-primary mb-2 text-sm font-semibold uppercase tracking-wide">
          {t('bookings.bookingInfo')}
        </Text>
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
    </ScrollView>
  );
}

export type UserBookingDetailProps = {
  query: UseQueryResult<UserBookingByIdDetail, Error>;
};

export function UserBookingDetail({ query }: UserBookingDetailProps) {
  const { t } = useTranslation();
  const { data, isLoading, isError, error, refetch } = query;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError) {
    return <UserBookingDetailError message={error?.message} onRetry={() => void refetch()} />;
  }

  if (!data) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-lg font-semibold text-foreground">
          {t('bookings.bookingNotFound')}
        </Text>
      </View>
    );
  }

  return <BookingDetailContent booking={data} />;
}
