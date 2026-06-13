import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, View } from 'react-native';

import { KeyboardFormScroll } from '@/components/common/keyboard-form-scroll';
import { useTranslation } from 'react-i18next';
import { XIcon } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Typography } from '@/components/ui/typography';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type {
  BookingPaymentMessage,
  BookingPaymentStatus,
  BookingPaymentType,
} from '@/features/bookings/types';
import type { StaffBookingPaymentCreateInput } from '@/features/staff-bookings/types';
import { useStaffBookingPaymentMutation } from '@/features/staff-bookings/hooks/use-staff-booking-mutations';

const PAYMENT_TYPES: BookingPaymentType[] = ['CASH', 'UPI', 'CHEQUE', 'BANK_TRANSFER'];
const PAYMENT_MESSAGES: BookingPaymentMessage[] = ['ADVANCE', 'PARTIAL', 'FINAL'];
const PAYMENT_STATUSES: BookingPaymentStatus[] = ['PENDING', 'CLEARED', 'BOUNCED'];

function defaultPaymentStatus(type: BookingPaymentType): BookingPaymentStatus {
  return type === 'CHEQUE' ? 'PENDING' : 'CLEARED';
}

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'shrink-0 rounded-full border px-3 py-2 active:opacity-80',
        selected ? 'border-primary bg-primary/15' : 'border-border bg-muted/40',
      )}>
      <Typography
        className={cn('text-sm font-medium', selected ? 'text-primary' : 'text-foreground')}>
        {label}
      </Typography>
    </Pressable>
  );
}

export function StaffBookingPaymentSheet({
  bookingId,
  visible,
  onClose,
}: {
  bookingId: string;
  visible: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const paymentMutation = useStaffBookingPaymentMutation(bookingId);

  const [type, setType] = useState<BookingPaymentType>('CASH');
  const [message, setMessage] = useState<BookingPaymentMessage>('ADVANCE');
  const [status, setStatus] = useState<BookingPaymentStatus>('CLEARED');
  const [amount, setAmount] = useState('');
  const [takenByAccount, setTakenByAccount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setType('CASH');
      setMessage('ADVANCE');
      setStatus('CLEARED');
      setAmount('');
      setTakenByAccount('');
      setRemarks('');
      setError(null);
    }
  }, [visible]);

  useEffect(() => {
    setStatus(defaultPaymentStatus(type));
  }, [type]);

  const handleSubmit = async () => {
    const parsedAmount = Number.parseInt(amount.trim(), 10);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError(t('bookings.staffPaymentAmountInvalid'));
      return;
    }

    const body: StaffBookingPaymentCreateInput = {
      type,
      amount: parsedAmount,
      message,
      status,
      ...(takenByAccount.trim() ? { takenByAccount: takenByAccount.trim() } : {}),
      ...(remarks.trim() ? { remarks: remarks.trim() } : {}),
    };

    try {
      setError(null);
      await paymentMutation.mutateAsync(body);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('bookings.staffPaymentFailed'));
    }
  };

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/30">
        <Pressable className="flex-1" onPress={onClose} />
        <View className="max-h-[85vh] rounded-t-3xl bg-card">
          <View className="flex-row items-center justify-between px-4 py-3">
            <Typography className="text-lg font-bold text-foreground">
              {t('bookings.staffAddPaymentTitle')}
            </Typography>
            <Pressable
              onPress={onClose}
              className="h-9 w-9 items-center justify-center rounded-full bg-muted">
              <XIcon size={18} color="#737373" />
            </Pressable>
          </View>

          <KeyboardFormScroll
            scrollViewProps={{ className: 'px-4 pb-4' }}
            footer={
              <View className="border-t border-border px-4 py-3">
                <Button
                  onPress={() => void handleSubmit()}
                  disabled={paymentMutation.isPending}
                  className="w-full">
                  {paymentMutation.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Typography className="font-semibold text-primary-foreground">
                      {t('bookings.staffSavePayment')}
                    </Typography>
                  )}
                </Button>
              </View>
            }>
            <View className="gap-4">
              <View className="gap-2">
                <Label>{t('bookings.staffPaymentType')}</Label>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2">
                    {PAYMENT_TYPES.map((value) => (
                      <FilterChip
                        key={value}
                        label={t(`bookings.paymentType.${value}`)}
                        selected={type === value}
                        onPress={() => setType(value)}
                      />
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View className="gap-2">
                <Label>{t('bookings.staffPaymentMessage')}</Label>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2">
                    {PAYMENT_MESSAGES.map((value) => (
                      <FilterChip
                        key={value}
                        label={t(`bookings.paymentMessage.${value}`)}
                        selected={message === value}
                        onPress={() => setMessage(value)}
                      />
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View className="gap-2">
                <Label>{t('bookings.staffPaymentStatus')}</Label>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2">
                    {PAYMENT_STATUSES.map((value) => (
                      <FilterChip
                        key={value}
                        label={t(`bookings.paymentStatus.${value}`)}
                        selected={status === value}
                        onPress={() => setStatus(value)}
                      />
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View className="gap-2">
                <Label>{t('bookings.staffPaymentAmount')}</Label>
                <Input
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="number-pad"
                  placeholder="0"
                />
              </View>

              <View className="gap-2">
                <Label>{t('bookings.staffPaymentAccount')}</Label>
                <Input
                  value={takenByAccount}
                  onChangeText={setTakenByAccount}
                  placeholder={t('bookings.optional')}
                  autoCapitalize="none"
                />
              </View>

              <View className="gap-2">
                <Label>{t('bookings.notes')}</Label>
                <Textarea
                  value={remarks}
                  onChangeText={setRemarks}
                  placeholder={t('bookings.notesPlaceholder')}
                  numberOfLines={3}
                />
              </View>

              {error ? <Typography className="text-sm text-destructive">{error}</Typography> : null}
            </View>
          </KeyboardFormScroll>
        </View>
      </View>
    </Modal>
  );
}
