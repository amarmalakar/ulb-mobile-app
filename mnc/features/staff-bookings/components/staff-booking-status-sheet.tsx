import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KeyboardFormScroll } from '@/components/common/keyboard-form-scroll';
import { useTranslation } from 'react-i18next';
import { XIcon } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Typography } from '@/components/common/typography';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { getBookingStatusConfig } from '@/features/bookings/lib/booking-status';
import type { BookingStatus } from '@/features/bookings/types';
import { getAllowedBookingStatusTransitions } from '@/features/staff-bookings/lib/booking-status-transitions';
import { useStaffBookingStatusMutation } from '@/features/staff-bookings/hooks/use-staff-booking-mutations';

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

export function StaffBookingStatusSheet({
  bookingId,
  currentStatus,
  visible,
  onClose,
}: {
  bookingId: string;
  currentStatus: BookingStatus;
  visible: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const statusMutation = useStaffBookingStatusMutation(bookingId);
  const allowed = getAllowedBookingStatusTransitions(currentStatus);

  const [nextStatus, setNextStatus] = useState<BookingStatus | null>(null);
  const [note, setNote] = useState('');
  const [rejectedReason, setRejectedReason] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setNextStatus(allowed[0] ?? null);
      setNote('');
      setRejectedReason('');
      setCancellationReason('');
      setError(null);
    }
  }, [visible, currentStatus]);

  const handleSubmit = async () => {
    if (!nextStatus) {
      setError(t('bookings.staffStatusRequired'));
      return;
    }
    if (nextStatus === 'REJECTED' && !rejectedReason.trim()) {
      setError(t('bookings.staffRejectionReasonRequired'));
      return;
    }
    if (nextStatus === 'CANCELLED' && !cancellationReason.trim()) {
      setError(t('bookings.staffCancellationReasonRequired'));
      return;
    }

    try {
      setError(null);
      await statusMutation.mutateAsync({
        status: nextStatus,
        ...(note.trim() ? { note: note.trim() } : {}),
        ...(nextStatus === 'REJECTED' ? { rejectedReason: rejectedReason.trim() } : {}),
        ...(nextStatus === 'CANCELLED' ? { cancellationReason: cancellationReason.trim() } : {}),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('bookings.staffStatusUpdateFailed'));
    }
  };

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-end bg-black/30">
          <Pressable className="flex-1" onPress={onClose} />
          <View
            className="max-h-[85vh] w-full rounded-t-3xl bg-card"
            style={{ paddingBottom: Math.max(insets.bottom, 12) }}
          >
            <View className="flex-row items-center justify-between px-4 py-3">
              <Typography className="text-lg font-bold text-foreground">
                {t('bookings.staffUpdateStatusTitle')}
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
                    disabled={statusMutation.isPending || allowed.length === 0}
                    className="w-full">
                    {statusMutation.isPending ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Typography className="font-semibold text-primary-foreground">
                        {t('bookings.staffSaveStatus')}
                      </Typography>
                    )}
                  </Button>
                </View>
              }>
              <View className="gap-4">
                <Typography className="text-sm text-muted-foreground">
                  {t('bookings.staffCurrentStatus', {
                    status: t(getBookingStatusConfig(currentStatus).labelKey),
                  })}
                </Typography>

                {allowed.length === 0 ? (
                  <Typography className="text-sm text-muted-foreground">
                    {t('bookings.staffNoStatusTransitions')}
                  </Typography>
                ) : (
                  <View className="gap-2">
                    <Label>{t('bookings.staffNewStatus')}</Label>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View className="flex-row gap-2">
                        {allowed.map((status) => (
                          <FilterChip
                            key={status}
                            label={t(getBookingStatusConfig(status).labelKey)}
                            selected={nextStatus === status}
                            onPress={() => setNextStatus(status)}
                          />
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                )}

                <View className="gap-2">
                  <Label>{t('bookings.staffStatusNote')}</Label>
                  <Textarea
                    value={note}
                    onChangeText={setNote}
                    placeholder={t('bookings.optional')}
                    numberOfLines={2}
                  />
                </View>

                {nextStatus === 'REJECTED' ? (
                  <View className="gap-2">
                    <Label>{t('bookings.staffRejectionReason')}</Label>
                    <Input
                      value={rejectedReason}
                      onChangeText={setRejectedReason}
                      placeholder={t('bookings.staffRejectionReasonPlaceholder')}
                    />
                  </View>
                ) : null}

                {nextStatus === 'CANCELLED' ? (
                  <View className="gap-2">
                    <Label>{t('bookings.staffCancellationReason')}</Label>
                    <Input
                      value={cancellationReason}
                      onChangeText={setCancellationReason}
                      placeholder={t('bookings.staffCancellationReasonPlaceholder')}
                    />
                  </View>
                ) : null}

                {error ? <Typography className="text-sm text-destructive">{error}</Typography> : null}
              </View>
            </KeyboardFormScroll>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
