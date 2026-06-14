import { useMemo } from 'react';
import { View } from 'react-native';
import { format, isValid, parseISO } from 'date-fns';
import { HistoryIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Icon } from '@/components/ui/icon';
import { Typography } from '@/components/common/typography';
import { cn } from '@/lib/utils';
import { getBookingStatusConfig } from '@/features/bookings/lib/booking-status';
import type {
  UserBookingPayment,
  UserBookingStatusHistoryItem,
} from '@/features/bookings/types';

type TimelineEntry =
  | { kind: 'history'; id: string; createdAt: string; data: UserBookingStatusHistoryItem }
  | { kind: 'payment'; id: string; createdAt: string; data: UserBookingPayment };

function formatTimelineTimestamp(value: string): string {
  const parsed = parseISO(value);
  if (!isValid(parsed)) return value;
  const datePart = format(parsed, 'MMM dd, yyyy').toUpperCase();
  const timePart = format(parsed, 'h:mm a');
  return `${datePart} · ${timePart}`;
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function BookingTimeline({
  history,
  payments,
}: {
  history: UserBookingStatusHistoryItem[];
  payments: UserBookingPayment[];
}) {
  const { t } = useTranslation();

  const entries = useMemo(() => {
    const merged: TimelineEntry[] = [
      ...history.map((item) => ({
        kind: 'history' as const,
        id: `history-${item.id}`,
        createdAt: item.createdAt,
        data: item,
      })),
      ...payments.map((item) => ({
        kind: 'payment' as const,
        id: `payment-${item.id}`,
        createdAt: item.createdAt,
        data: item,
      })),
    ];
    return merged.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [history, payments]);

  if (entries.length === 0) {
    return (
      <Typography className="text-muted-foreground text-sm">{t('bookings.timelineEmpty')}</Typography>
    );
  }

  return (
    <View>
      <View className="mb-4 flex-row items-center gap-2">
        <Icon as={HistoryIcon} className="text-muted-foreground size-4" />
        <Typography className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
          {t('bookings.timeline')}
        </Typography>
      </View>

      <View className="pl-1">
        {entries.map((entry, index) => {
          const isLast = index === entries.length - 1;
          const isPayment = entry.kind === 'payment';

          let title = '';
          let subtitle = '';

          if (entry.kind === 'history') {
            const statusConfig = getBookingStatusConfig(entry.data.status);
            title = t(statusConfig.labelKey);
            const actorLabel =
              entry.data.actorType === 'USER'
                ? t('bookings.actorUser')
                : entry.data.actorType === 'STAFF'
                  ? t('bookings.actorStaff')
                  : t('bookings.actorSystem');
            subtitle = entry.data.note
              ? `${actorLabel} · ${entry.data.note}`
              : actorLabel;
          } else {
            const payment = entry.data;
            const messageLabel = t(`bookings.paymentMessage.${payment.message}`);
            title = `${messageLabel} · ${formatAmount(payment.amount)}`;
            subtitle = `${t(`bookings.paymentType.${payment.type}`)} · ${t(`bookings.paymentStatus.${payment.status}`)}`;
          }

          return (
            <View key={entry.id} className="min-h-16 flex-row">
              <View className="items-center">
                <View
                  className={cn(
                    'h-4 w-4 rounded-full',
                    isPayment ? 'bg-emerald-500' : 'bg-foreground',
                  )}
                />
                {!isLast ? <View className="mt-1 w-px flex-1 bg-border" /> : null}
              </View>

              <View className="ml-4 flex-1 pb-6">
                <Typography className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">
                  {formatTimelineTimestamp(entry.createdAt)}
                </Typography>
                <Typography className="mt-0.5 text-base font-semibold text-foreground">{title}</Typography>
                {subtitle ? (
                  <Typography className="text-muted-foreground mt-0.5 text-sm" numberOfLines={2}>
                    {subtitle}
                  </Typography>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
