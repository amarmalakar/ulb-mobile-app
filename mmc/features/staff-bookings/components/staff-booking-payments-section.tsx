import { View } from 'react-native';
import { format, parseISO } from 'date-fns';
import { WalletIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Icon } from '@/components/ui/icon';
import { Typography } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { UserBookingPayment } from '@/features/bookings/types';

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function StaffBookingPaymentsSection({ payments }: { payments: UserBookingPayment[] }) {
  const { t } = useTranslation();

  if (payments.length === 0) {
    return null;
  }

  return (
    <View className="gap-3 rounded-2xl border border-border bg-card p-4">
      <View className="flex-row items-center gap-2">
        <Icon as={WalletIcon} className="size-4 text-primary" />
        <Typography className="text-sm font-semibold uppercase tracking-wide text-primary">
          {t('bookings.staffPaymentsTitle')}
        </Typography>
      </View>

      {payments.map((payment) => (
        <View
          key={payment.id}
          className="gap-1 rounded-xl border border-border bg-muted/20 p-3">
          <View className="flex-row items-start justify-between gap-2">
            <Typography className="flex-1 text-sm font-semibold text-foreground">
              {t(`bookings.paymentMessage.${payment.message}`)} · {formatAmount(payment.amount)}
            </Typography>
            <Badge
              className={cn(
                'rounded-md px-2 py-0.5',
                payment.status === 'CLEARED'
                  ? 'bg-emerald-100'
                  : payment.status === 'BOUNCED'
                    ? 'bg-destructive/15'
                    : 'bg-amber-100',
              )}>
              <Typography
                className={cn(
                  'text-[10px] font-semibold',
                  payment.status === 'CLEARED'
                    ? 'text-emerald-800'
                    : payment.status === 'BOUNCED'
                      ? 'text-destructive'
                      : 'text-amber-800',
                )}>
                {t(`bookings.paymentStatus.${payment.status}`)}
              </Typography>
            </Badge>
          </View>
          <Typography className="text-xs text-muted-foreground">
            {t(`bookings.paymentType.${payment.type}`)}
            {payment.takenByStaffName ? ` · ${payment.takenByStaffName}` : ''}
          </Typography>
          {payment.takenByAccount ? (
            <Typography className="text-xs text-muted-foreground">{payment.takenByAccount}</Typography>
          ) : null}
          {payment.remarks ? (
            <Typography className="text-xs text-muted-foreground">{payment.remarks}</Typography>
          ) : null}
          <Typography className="text-[11px] text-muted-foreground">
            {format(parseISO(payment.createdAt), 'dd MMM yyyy · h:mm a')}
          </Typography>
        </View>
      ))}
    </View>
  );
}
