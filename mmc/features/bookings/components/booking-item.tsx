import { Pressable, View } from 'react-native';
import { Building2Icon, CarIcon, MapPinIcon } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';

import { Icon } from '@/components/ui/icon';
import { Typography } from '@/components/ui/typography';
import { resolveTicketImageUrl } from '@/features/ticket-info/lib/resolve-ticket-image-url';
import type { UserBookingResourceListItem } from '@/features/bookings/types';
import { useRouter } from 'expo-router';
import { bookingRoutes } from '@/features/bookings/lib/booking-routes';

const IMAGE_HEIGHT = 160;

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

export function BookingItem({ booking }: { booking: UserBookingResourceListItem }) {
  const { t } = useTranslation();
  const router = useRouter();
  const TypeIcon = booking.type === 'VEHICLE' ? CarIcon : Building2Icon;
  const typeLabel =
    booking.type === 'VEHICLE' ? t('bookings.typeVehicle') : t('bookings.typeBuilding');
  const unit = booking.pricingUnit === 'HOUR' ? t('bookings.perHour') : t('bookings.perDay');
  const thumbnailUri = booking.thumbnailUrl
    ? resolveTicketImageUrl(booking.thumbnailUrl)
    : null;

  return (
    <Pressable
      className="active:opacity-90"
      onPress={() => {
        router.push(bookingRoutes.resourceInfo(booking.id) as never);
      }}
    >
      <View className="bg-card overflow-hidden rounded-2xl border border-border">
        {thumbnailUri ? (
          <View style={{ width: '100%', height: IMAGE_HEIGHT }} className="bg-muted">
            <Image
              source={{ uri: thumbnailUri }}
              style={{ width: '100%', height: IMAGE_HEIGHT }}
              contentFit="cover"
              transition={200}
            />
          </View>
        ) : (
          <View
            style={{ width: '100%', height: IMAGE_HEIGHT }}
            className="items-center justify-center bg-muted"
          >
            <Icon as={TypeIcon} className="text-muted-foreground" size={40} />
          </View>
        )}

        <View className="gap-2 p-4">
          <View className="flex-row items-start justify-between gap-3">
            <Typography className="flex-1 text-lg font-semibold text-foreground">{booking.name}</Typography>
            {booking.isFeatured ? (
              <View className="rounded-full bg-primary/15 px-2 py-1">
                <Typography className="text-xs font-semibold text-primary">{t('bookings.featured')}</Typography>
              </View>
            ) : null}
          </View>

          <Typography className="text-sm leading-6 text-muted-foreground" numberOfLines={3}>
            {booking.description}
          </Typography>

          <View className="mt-1 flex-row items-center justify-between gap-3">
            <View className="min-w-0 flex-1 flex-row items-center gap-1">
              {booking.locationAddress ? (
                <>
                  <Icon as={MapPinIcon} className="text-muted-foreground size-3.5 shrink-0" />
                  <Typography className="text-sm font-medium text-foreground" numberOfLines={1}>
                    {booking.locationAddress}
                  </Typography>
                </>
              ) : (
                <>
                  <Icon as={TypeIcon} className="text-muted-foreground size-3.5 shrink-0" />
                  <Typography className="text-sm font-medium text-foreground">{typeLabel}</Typography>
                </>
              )}
            </View>

            <Typography className="shrink-0 text-base font-semibold text-primary">
              {formatCurrency(booking.unitPrice, booking.currency)}/{unit}
            </Typography>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
