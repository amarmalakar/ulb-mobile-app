import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { bookingRoutes } from '@/features/bookings/lib/booking-routes';
import { format, parseISO } from 'date-fns';
import {
  Building2Icon,
  CalendarRangeIcon,
  CarIcon,
  HashIcon,
  PhoneIcon,
  UserIcon,
} from 'lucide-react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';

import { Icon } from '@/components/ui/icon';
import { Typography } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getBookingStatusConfig } from '@/features/bookings/lib/booking-status';
import { resolveTicketImageUrl } from '@/features/ticket-info/lib/resolve-ticket-image-url';
import type { StaffBookingListItem } from '@/features/staff-bookings/types';

const THUMB_SIZE = 72;

function formatAmount(amount: number): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(amount);
}

export function StaffBookingListCard({ booking }: { booking: StaffBookingListItem }) {
  const { t } = useTranslation();
  const router = useRouter();
  const statusConfig = getBookingStatusConfig(booking.status);
  const TypeIcon = booking.resource.type === 'VEHICLE' ? CarIcon : Building2Icon;
  const thumbnailUri = booking.resource.thumbnailUrl
    ? resolveTicketImageUrl(booking.resource.thumbnailUrl)
    : null;

  return (
    <Pressable
      className="active:opacity-90"
      onPress={() => {
        router.push(bookingRoutes.detail(booking.id) as never);
      }}>
    <View className="overflow-hidden rounded-2xl border border-border bg-card p-4">
      <View className="flex-row gap-3">
        <View
          style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
          className="overflow-hidden rounded-xl bg-muted">
          {thumbnailUri ? (
            <Image
              source={{ uri: thumbnailUri }}
              style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
              contentFit="cover"
            />
          ) : (
            <View className="h-full w-full items-center justify-center">
              <Icon as={TypeIcon} className="text-muted-foreground" size={28} />
            </View>
          )}
        </View>

        <View className="min-w-0 flex-1 gap-1.5">
          <View className="flex-row items-start justify-between gap-2">
            <Typography className="flex-1 text-base font-semibold text-foreground" numberOfLines={2}>
              {booking.resource.name}
            </Typography>
            <Badge className={cn('rounded-md px-2 py-0.5', statusConfig.badgeClass)}>
              <Typography className={cn('text-[11px] font-semibold', statusConfig.textClass)}>
                {t(statusConfig.labelKey)}
              </Typography>
            </Badge>
          </View>

          <View className="flex-row items-center gap-1">
            <Icon as={HashIcon} className="size-3.5 text-muted-foreground" />
            <Typography className="text-xs font-medium text-muted-foreground">
              {booking.bookingTokenId}
            </Typography>
          </View>

          <View className="flex-row items-center gap-1">
            <Icon as={CalendarRangeIcon} className="size-3.5 text-muted-foreground" />
            <Typography className="text-xs text-muted-foreground">
              {format(parseISO(booking.startsAt), 'dd MMM yyyy')}
              {' – '}
              {format(parseISO(booking.endsAt), 'dd MMM yyyy')}
            </Typography>
          </View>

          {booking.contactName ? (
            <View className="flex-row items-center gap-1">
              <Icon as={UserIcon} className="size-3.5 text-muted-foreground" />
              <Typography className="text-xs text-muted-foreground" numberOfLines={1}>
                {booking.contactName}
              </Typography>
            </View>
          ) : null}

          {booking.contactPhone ? (
            <View className="flex-row items-center gap-1">
              <Icon as={PhoneIcon} className="size-3.5 text-muted-foreground" />
              <Typography className="text-xs text-muted-foreground">{booking.contactPhone}</Typography>
            </View>
          ) : null}

          <View className="mt-1 flex-row items-center justify-between">
            <Typography className="text-sm font-bold text-primary">
              {t('bookings.totalAmount', { amount: formatAmount(booking.totalAmount) })}
            </Typography>
            {booking.paidAmount > 0 ? (
              <Typography className="text-xs text-muted-foreground">
                {t('bookings.paidAmount', { amount: formatAmount(booking.paidAmount) })}
              </Typography>
            ) : null}
          </View>
        </View>
      </View>
    </View>
    </Pressable>
  );
}
