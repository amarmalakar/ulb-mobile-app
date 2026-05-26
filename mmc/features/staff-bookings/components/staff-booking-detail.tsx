import { useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
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
import { Typography } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BookingTimeline } from '@/features/bookings/components/booking-timeline';
import { getBookingStatusConfig } from '@/features/bookings/lib/booking-status';
import { resolveTicketImageUrl } from '@/features/ticket-info/lib/resolve-ticket-image-url';
import { cn } from '@/lib/utils';
import type { StaffBookingDetail } from '@/features/staff-bookings/types';
import { StaffBookingResourceSection } from '@/features/staff-bookings/components/staff-booking-resource-section';
import { StaffBookingPaymentsSection } from '@/features/staff-bookings/components/staff-booking-payments-section';
import { StaffBookingPaymentSheet } from '@/features/staff-bookings/components/staff-booking-payment-sheet';
import { StaffBookingStatusSheet } from '@/features/staff-bookings/components/staff-booking-status-sheet';
import {
  canRecordBookingPayment,
  getAllowedBookingStatusTransitions,
} from '@/features/staff-bookings/lib/booking-status-transitions';

const THUMB_SIZE = 88;

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount);
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
      {RowIcon ? <Icon as={RowIcon} className="mt-0.5 size-4 shrink-0 text-muted-foreground" /> : null}
      <View className="min-w-0 flex-1">
        <Typography className="text-xs text-muted-foreground">{label}</Typography>
        <Typography className="text-sm font-medium text-foreground">{value}</Typography>
      </View>
    </View>
  );
}

function StaffBookingDetailError({
  message,
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center gap-4 px-6 py-12">
      <View className="size-20 items-center justify-center rounded-full bg-destructive/10">
        <Icon as={AlertCircleIcon} className="text-destructive" size={40} />
      </View>
      <Typography className="text-center text-lg font-bold text-destructive">{t('common.errorTitle')}</Typography>
      <Typography className="text-center text-sm text-muted-foreground">
        {message ?? t('bookings.detailLoadError')}
      </Typography>
      <Button size="sm" variant="outline" onPress={onRetry}>
        <Icon as={RefreshCcwIcon} className="size-4" />
        <Typography>{t('common.retry')}</Typography>
      </Button>
    </View>
  );
}

function StaffBookingDetailContent({ booking }: { booking: StaffBookingDetail }) {
  const { t } = useTranslation();
  const [paymentSheetOpen, setPaymentSheetOpen] = useState(false);
  const [statusSheetOpen, setStatusSheetOpen] = useState(false);

  const statusConfig = getBookingStatusConfig(booking.status);
  const TypeIcon = booking.resource.type === 'VEHICLE' ? CarIcon : Building2Icon;
  const thumbnailUri = booking.resource.thumbnailUrl
    ? resolveTicketImageUrl(booking.resource.thumbnailUrl)
    : null;
  const canAddPayment = canRecordBookingPayment(booking.status);
  const canUpdateStatus = getAllowedBookingStatusTransitions(booking.status).length > 0;

  return (
    <>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-5 px-4 pb-10 pt-2">
        <View className="flex-row gap-3 rounded-2xl border border-border bg-card p-4">
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
              <Icon as={HashIcon} className="size-3.5 text-muted-foreground" />
              <Typography className="text-xs font-medium text-muted-foreground">
                {booking.bookingTokenId}
              </Typography>
            </View>
          </View>
        </View>

        <View className="flex-row gap-3">
          {canUpdateStatus ? (
            <Button variant="outline" className="flex-1" onPress={() => setStatusSheetOpen(true)}>
              <Typography className="font-semibold">{t('bookings.staffUpdateStatus')}</Typography>
            </Button>
          ) : null}
          {canAddPayment ? (
            <Button className="flex-1" onPress={() => setPaymentSheetOpen(true)}>
              <Typography className="font-semibold text-primary-foreground">
                {t('bookings.staffAddPayment')}
              </Typography>
            </Button>
          ) : null}
        </View>

        <View className="rounded-2xl border border-border bg-card p-4">
          <Typography className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">
            {t('bookings.amountSummary')}
          </Typography>
          <View className="flex-row flex-wrap gap-4">
            <View>
              <Typography className="text-xs text-muted-foreground">{t('bookings.totalAmountLabel')}</Typography>
              <Typography className="text-lg font-bold text-foreground">
                ₹{formatAmount(booking.totalAmount)}
              </Typography>
            </View>
            <View>
              <Typography className="text-xs text-muted-foreground">{t('bookings.paidAmountLabel')}</Typography>
              <Typography className="text-lg font-bold text-emerald-600">
                ₹{formatAmount(booking.paidAmount)}
              </Typography>
            </View>
            <View>
              <Typography className="text-xs text-muted-foreground">{t('bookings.balanceLabel')}</Typography>
              <Typography className="text-lg font-bold text-primary">
                ₹{formatAmount(booking.balance)}
              </Typography>
            </View>
          </View>
        </View>

        <View className="rounded-2xl border border-border bg-card p-4">
          <Typography className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
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
            <DetailRow label={t('bookings.guestCount')} value={String(booking.guestCount)} />
          ) : null}
          {booking.notes ? <DetailRow label={t('bookings.notes')} value={booking.notes} /> : null}
          {booking.rejectedReason ? (
            <DetailRow label={t('bookings.staffRejectionReason')} value={booking.rejectedReason} />
          ) : null}
          {booking.cancellationReason ? (
            <DetailRow
              label={t('bookings.staffCancellationReason')}
              value={booking.cancellationReason}
            />
          ) : null}
        </View>

        <StaffBookingResourceSection resource={booking.resource} />

        <StaffBookingPaymentsSection payments={booking.payments} />

        <Separator />

        <View className="rounded-2xl border border-border bg-card p-4">
          <BookingTimeline history={booking.history} payments={booking.payments} />
        </View>
      </ScrollView>

      <StaffBookingPaymentSheet
        bookingId={booking.id}
        visible={paymentSheetOpen}
        onClose={() => setPaymentSheetOpen(false)}
      />
      <StaffBookingStatusSheet
        bookingId={booking.id}
        currentStatus={booking.status}
        visible={statusSheetOpen}
        onClose={() => setStatusSheetOpen(false)}
      />
    </>
  );
}

export type StaffBookingDetailProps = {
  query: UseQueryResult<StaffBookingDetail, Error>;
};

export function StaffBookingDetailView({ query }: StaffBookingDetailProps) {
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
    return <StaffBookingDetailError message={error?.message} onRetry={() => void refetch()} />;
  }

  if (!data) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Icon as={Building2Icon} className="mb-3 text-muted-foreground" size={40} />
        <Typography className="text-center text-lg font-semibold text-foreground">
          {t('bookings.bookingNotFound')}
        </Typography>
      </View>
    );
  }

  return <StaffBookingDetailContent booking={data} />;
}
