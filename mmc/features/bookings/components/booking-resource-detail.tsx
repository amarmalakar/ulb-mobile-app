import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import {
  AlertCircleIcon,
  Building2Icon,
  CalendarCheckIcon,
  CarIcon,
  MapPinIcon,
  RefreshCcwIcon,
  UsersIcon,
} from 'lucide-react-native';
import { Image } from 'expo-image';
import MapView, { Marker } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import type { UseQueryResult } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Typography } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import type { UserBookingResourceDetail } from '@/features/bookings/types';
import { resolveTicketImageUrl } from '@/features/ticket-info/lib/resolve-ticket-image-url';

const HERO_HEIGHT = 360;
const SLIDE_INTERVAL_MS = 3000;

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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between gap-4 py-2">
      <Typography className="text-muted-foreground shrink-0 text-sm">{label}</Typography>
      <Typography className="flex-1 text-right text-sm font-medium text-foreground">{value}</Typography>
    </View>
  );
}

function BookingResourceDetailSkeleton() {
  return (
    <View className="flex-1">
      <Skeleton style={{ width: '100%', height: HERO_HEIGHT }} />
      <View className="gap-3 p-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-32 w-full" />
      </View>
    </View>
  );
}

function BookingResourceDetailError({
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
      <View className="gap-1.5">
        <Typography className="text-destructive text-center text-lg font-bold">
          {t('common.errorTitle')}
        </Typography>
        <Typography className="text-muted-foreground text-center text-sm">
          {message ?? t('bookings.detailLoadError')}
        </Typography>
      </View>
      <Button size="sm" variant="outline" onPress={onRetry}>
        <Icon as={RefreshCcwIcon} className="size-4" />
        <Typography>{t('common.retry')}</Typography>
      </Button>
    </View>
  );
}

function ImageGallery({ images }: { images: UserBookingResourceDetail['images'] }) {
  const sliderRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const sorted = useMemo(
    () => [...images].sort((a, b) => a.sortOrder - b.sortOrder),
    [images],
  );

  useEffect(() => {
    setActiveIndex(0);
    sliderRef.current?.scrollTo({ x: 0, animated: false });
  }, [sorted]);

  useEffect(() => {
    if (sorted.length <= 1) return;

    const intervalId = setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % sorted.length;
        sliderRef.current?.scrollTo({ x: width * next, animated: true });
        return next;
      });
    }, SLIDE_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [sorted.length, width]);

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(
      event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width,
    );
    setActiveIndex(nextIndex);
  };

  if (sorted.length === 0) {
    return (
      <View
        style={{ width: '100%', height: HERO_HEIGHT }}
        className="items-center justify-center bg-muted"
      >
        <Typography className="text-muted-foreground text-sm">{t('bookings.noPhotos')}</Typography>
      </View>
    );
  }

  return (
    <View style={{ height: HERO_HEIGHT }}>
      <ScrollView
        ref={sliderRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={{ height: HERO_HEIGHT }}
        onMomentumScrollEnd={onScrollEnd}
      >
        {sorted.map((image) => (
          <Image
            key={image.id}
            source={{ uri: resolveTicketImageUrl(image.url) }}
            style={{ width, height: HERO_HEIGHT }}
            contentFit="cover"
          />
        ))}
      </ScrollView>

      {sorted.length > 1 ? (
        <View className="absolute bottom-3 left-0 right-0 flex-row items-center justify-center gap-2">
          {sorted.map((image, index) => (
            <View
              key={image.id}
              className={
                index === activeIndex
                  ? 'h-2.5 w-6 rounded-full bg-white'
                  : 'h-2.5 w-2.5 rounded-full bg-white/45'
              }
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function ResourceDetailContent({
  resource,
  onBookNow,
  isBooking,
}: {
  resource: UserBookingResourceDetail;
  onBookNow: () => void;
  isBooking?: boolean;
}) {
  const { t } = useTranslation();
  const TypeIcon = resource.type === 'VEHICLE' ? CarIcon : Building2Icon;
  const typeLabel =
    resource.type === 'VEHICLE' ? t('bookings.typeVehicle') : t('bookings.typeBuilding');
  const unit =
    resource.pricingUnit === 'HOUR' ? t('bookings.perHour') : t('bookings.perDay');
  const hasMap =
    resource.latitude != null &&
    resource.longitude != null &&
    Number.isFinite(resource.latitude) &&
    Number.isFinite(resource.longitude);

  const maxDurationLabel =
    resource.pricingUnit === 'DAY' && resource.maxDurationDays != null
      ? t('bookings.maxDurationDays', { count: resource.maxDurationDays })
      : resource.pricingUnit === 'HOUR' && resource.maxDurationHours != null
        ? t('bookings.maxDurationHours', { count: resource.maxDurationHours })
        : null;

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-28"
      >
        <ImageGallery images={resource.images} />

        <View className="gap-4 p-4">
          <View className="flex-row flex-wrap items-start justify-between gap-2">
            <Typography className="flex-1 text-2xl font-bold text-foreground">{resource.name}</Typography>
            {resource.isFeatured ? (
              <Badge className="rounded-full bg-primary/15">
                <Typography className="text-xs font-semibold text-primary">{t('bookings.featured')}</Typography>
              </Badge>
            ) : null}
          </View>

          <View className="flex-row flex-wrap items-center gap-2">
            <Badge variant="secondary">
              <Icon as={TypeIcon} className="mr-1 size-3.5" />
              <Typography className="text-xs font-semibold">{typeLabel}</Typography>
            </Badge>
            <Typography className="text-primary text-lg font-bold">
              {formatCurrency(resource.unitPrice, resource.currency)}
              <Typography className="text-muted-foreground text-sm font-medium"> / {unit}</Typography>
            </Typography>
          </View>

          {resource.requiresApproval ? (
            <Typography className="text-muted-foreground text-sm">{t('bookings.requiresApproval')}</Typography>
          ) : null}

          <Typography className="text-base leading-6 text-foreground">{resource.description}</Typography>

          <View className="rounded-xl border border-border bg-card p-3">
            <Typography className="text-primary mb-2 text-sm font-semibold uppercase tracking-wide">
              {t('bookings.details')}
            </Typography>
            <DetailRow
              label={t('bookings.minAdvance')}
              value={t('bookings.minAdvanceHours', { hours: resource.minAdvanceHours })}
            />
            {maxDurationLabel ? (
              <DetailRow label={t('bookings.maxDuration')} value={maxDurationLabel} />
            ) : null}
          </View>

          {resource.type === 'BUILDING' && resource.buildingDetail ? (
            <View className="rounded-xl border border-border bg-card p-3">
              <View className="mb-2 flex-row items-center gap-2">
                <Icon as={Building2Icon} className="text-primary size-5" />
                <Typography className="text-primary text-sm font-semibold uppercase tracking-wide">
                  {t('bookings.buildingInfo')}
                </Typography>
              </View>
              {resource.buildingDetail.capacity != null ? (
                <View className="mb-2 flex-row items-center gap-2">
                  <Icon as={UsersIcon} className="text-muted-foreground size-4" />
                  <Typography className="text-foreground text-sm">
                    {t('bookings.capacity', { count: resource.buildingDetail.capacity })}
                  </Typography>
                </View>
              ) : null}
              {resource.buildingDetail.amenities.length > 0 ? (
                <View className="mb-2 flex-row flex-wrap gap-1.5">
                  {resource.buildingDetail.amenities.map((amenity) => (
                    <Badge key={amenity} variant="outline" className="rounded-md">
                      <Typography className="text-xs">{amenity}</Typography>
                    </Badge>
                  ))}
                </View>
              ) : null}
              {resource.buildingDetail.rulesText ? (
                <Typography className="text-muted-foreground text-sm leading-5">
                  {resource.buildingDetail.rulesText}
                </Typography>
              ) : null}
            </View>
          ) : null}

          {resource.type === 'VEHICLE' && resource.vehicleDetail ? (
            <View className="rounded-xl border border-border bg-card p-3">
              <View className="mb-2 flex-row items-center gap-2">
                <Icon as={CarIcon} className="text-primary size-5" />
                <Typography className="text-primary text-sm font-semibold uppercase tracking-wide">
                  {t('bookings.vehicleInfo')}
                </Typography>
              </View>
              {resource.vehicleDetail.vehicleType ? (
                <DetailRow label={t('bookings.vehicleType')} value={resource.vehicleDetail.vehicleType} />
              ) : null}
              {resource.vehicleDetail.registrationNo ? (
                <DetailRow
                  label={t('bookings.registrationNo')}
                  value={resource.vehicleDetail.registrationNo}
                />
              ) : null}
              {resource.vehicleDetail.seats != null ? (
                <DetailRow
                  label={t('bookings.seats')}
                  value={String(resource.vehicleDetail.seats)}
                />
              ) : null}
              {resource.vehicleDetail.fuelType ? (
                <DetailRow label={t('bookings.fuelType')} value={resource.vehicleDetail.fuelType} />
              ) : null}
            </View>
          ) : null}

          {resource.locationAddress || hasMap ? (
            <View className="overflow-hidden rounded-xl border border-border bg-card">
              <View className="flex-row items-center gap-2 border-b border-border px-4 py-3">
                <Icon as={MapPinIcon} className="text-primary size-5" />
                <Typography className="text-base font-medium text-foreground">{t('bookings.location')}</Typography>
              </View>
              {resource.locationAddress ? (
                <Typography className="px-4 py-3 text-sm text-muted-foreground">
                  {resource.locationAddress}
                </Typography>
              ) : null}
              {hasMap ? (
                <View className="h-48 border-t border-border">
                  <MapView
                    style={{ flex: 1 }}
                    initialRegion={{
                      latitude: resource.latitude!,
                      longitude: resource.longitude!,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    pitchEnabled={false}
                    rotateEnabled={false}
                  >
                    <Marker
                      coordinate={{
                        latitude: resource.latitude!,
                        longitude: resource.longitude!,
                      }}
                    />
                  </MapView>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-card px-4 pb-6 pt-3">
        <Button className="h-14 rounded-2xl" disabled={isBooking} onPress={onBookNow}>
          {isBooking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon as={CalendarCheckIcon} className="text-primary-foreground size-5" />
              <Typography className="text-primary-foreground text-base font-semibold">
                {t('bookings.bookNow')}
              </Typography>
            </>
          )}
        </Button>
      </View>
    </View>
  );
}

export type BookingResourceDetailProps = {
  query: UseQueryResult<UserBookingResourceDetail, Error>;
  onBookNow: (resource: UserBookingResourceDetail) => void;
  isBooking?: boolean;
};

export function BookingResourceDetail({ query, onBookNow, isBooking }: BookingResourceDetailProps) {
  const { t } = useTranslation();
  const { data, isLoading, isError, error, refetch } = query;

  if (isLoading) {
    return <BookingResourceDetailSkeleton />;
  }

  if (isError) {
    return (
      <BookingResourceDetailError message={error?.message} onRetry={() => void refetch()} />
    );
  }

  if (!data) {
    return (
      <View className="flex-1 items-center justify-center px-6 py-12">
        <Typography className="text-center text-lg font-semibold text-foreground">
          {t('bookings.notFound')}
        </Typography>
      </View>
    );
  }

  return (
    <ResourceDetailContent
      resource={data}
      onBookNow={() => onBookNow(data)}
      isBooking={isBooking}
    />
  );
}
