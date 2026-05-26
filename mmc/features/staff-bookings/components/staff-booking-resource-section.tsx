import { ScrollView, View } from 'react-native';
import { Building2Icon, CarIcon, MapPinIcon, UsersIcon } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Typography } from '@/components/ui/typography';
import { resolveTicketImageUrl } from '@/features/ticket-info/lib/resolve-ticket-image-url';
import type { StaffBookingResourceInfo } from '@/features/staff-bookings/types';

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency || 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="py-1.5">
      <Typography className="text-xs text-muted-foreground">{label}</Typography>
      <Typography className="text-sm font-medium text-foreground">{value}</Typography>
    </View>
  );
}

export function StaffBookingResourceSection({ resource }: { resource: StaffBookingResourceInfo }) {
  const { t } = useTranslation();
  const TypeIcon = resource.type === 'VEHICLE' ? CarIcon : Building2Icon;
  const typeLabel =
    resource.type === 'VEHICLE' ? t('bookings.typeVehicle') : t('bookings.typeBuilding');
  const unit = resource.pricingUnit === 'HOUR' ? t('bookings.perHour') : t('bookings.perDay');
  const sortedImages = [...resource.images].sort((a, b) => a.sortOrder - b.sortOrder);

  const maxDurationLabel =
    resource.pricingUnit === 'DAY' && resource.maxDurationDays != null
      ? t('bookings.maxDurationDays', { count: resource.maxDurationDays })
      : resource.pricingUnit === 'HOUR' && resource.maxDurationHours != null
        ? t('bookings.maxDurationHours', { count: resource.maxDurationHours })
        : null;

  return (
    <View className="gap-4 rounded-2xl border border-border bg-card p-4">
      <Typography className="text-sm font-semibold uppercase tracking-wide text-primary">
        {t('bookings.staffResourceSectionTitle')}
      </Typography>

      {sortedImages.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1">
          <View className="flex-row gap-2 px-1">
            {sortedImages.map((img) => {
              const uri = resolveTicketImageUrl(img.url);
              if (!uri) return null;
              return (
                <Image
                  key={img.id}
                  source={{ uri }}
                  style={{ width: 140, height: 100, borderRadius: 12 }}
                  contentFit="cover"
                />
              );
            })}
          </View>
        </ScrollView>
      ) : null}

      <View className="flex-row flex-wrap items-center gap-2">
        <Badge variant="secondary">
          <Icon as={TypeIcon} className="mr-1 size-3.5" />
          <Typography className="text-xs font-semibold">{typeLabel}</Typography>
        </Badge>
        <Typography className="text-lg font-bold text-primary">
          {formatCurrency(resource.unitPrice, resource.currency)}
          <Typography className="text-sm font-medium text-muted-foreground"> / {unit}</Typography>
        </Typography>
      </View>

      {resource.requiresApproval ? (
        <Typography className="text-sm text-muted-foreground">{t('bookings.requiresApproval')}</Typography>
      ) : null}

      <Typography className="text-base leading-6 text-foreground">{resource.description}</Typography>

      {resource.locationAddress ? (
        <View className="flex-row items-start gap-2">
          <Icon as={MapPinIcon} className="mt-0.5 size-4 text-muted-foreground" />
          <Typography className="flex-1 text-sm text-foreground">{resource.locationAddress}</Typography>
        </View>
      ) : null}

      <View className="rounded-xl border border-border bg-muted/30 p-3">
        <DetailRow
          label={t('bookings.minAdvance')}
          value={t('bookings.minAdvanceHours', { hours: resource.minAdvanceHours })}
        />
        {maxDurationLabel ? (
          <DetailRow label={t('bookings.maxDuration')} value={maxDurationLabel} />
        ) : null}
      </View>

      {resource.type === 'BUILDING' && resource.buildingDetail ? (
        <View className="rounded-xl border border-border bg-muted/30 p-3">
          <View className="mb-2 flex-row items-center gap-2">
            <Icon as={Building2Icon} className="size-5 text-primary" />
            <Typography className="text-sm font-semibold uppercase tracking-wide text-primary">
              {t('bookings.buildingInfo')}
            </Typography>
          </View>
          {resource.buildingDetail.capacity != null ? (
            <View className="mb-2 flex-row items-center gap-2">
              <Icon as={UsersIcon} className="size-4 text-muted-foreground" />
              <Typography className="text-sm text-foreground">
                {t('bookings.capacity', { count: resource.buildingDetail.capacity })}
              </Typography>
            </View>
          ) : null}
          {resource.buildingDetail.amenities.length > 0 ? (
            <Typography className="text-sm text-foreground">
              {resource.buildingDetail.amenities.join(' · ')}
            </Typography>
          ) : null}
          {resource.buildingDetail.rulesText ? (
            <Typography className="mt-2 text-sm text-muted-foreground">
              {resource.buildingDetail.rulesText}
            </Typography>
          ) : null}
        </View>
      ) : null}

      {resource.type === 'VEHICLE' && resource.vehicleDetail ? (
        <View className="rounded-xl border border-border bg-muted/30 p-3">
          <View className="mb-2 flex-row items-center gap-2">
            <Icon as={CarIcon} className="size-5 text-primary" />
            <Typography className="text-sm font-semibold uppercase tracking-wide text-primary">
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
            <DetailRow label={t('bookings.seats')} value={String(resource.vehicleDetail.seats)} />
          ) : null}
          {resource.vehicleDetail.fuelType ? (
            <DetailRow label={t('bookings.fuelType')} value={resource.vehicleDetail.fuelType} />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
