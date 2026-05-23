import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { addHours, format, startOfDay, startOfMonth } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useUserAuth } from '@/components/provider/user-auth-provider';
import { BookingCalendar } from '@/features/bookings/components/booking-calendar';
import { BookingCreateForm } from '@/features/bookings/components/booking-create-form';
import { useBookingForm } from '@/features/bookings/hooks/use-booking-form';
import { useCreateUserBookingMutation } from '@/features/bookings/hooks/use-create-user-booking-mutation';
import { useUserBookingResourceScheduleQuery } from '@/features/bookings/hooks/use-user-booking-resource-schedule-query';
import { buildDayBookingRange, monthScheduleRange } from '@/features/bookings/lib/booking-date-utils';

type UserBookingFlowProps = {
  resourceId: string;
};

export function UserBookingFlow({ resourceId }: UserBookingFlowProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { userInfo } = useUserAuth();
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const range = useMemo(() => monthScheduleRange(visibleMonth), [visibleMonth]);
  const scheduleQuery = useUserBookingResourceScheduleQuery({
    resourceId,
    from: range.from,
    to: range.to,
  });

  const resource = scheduleQuery.data?.resource;
  const isHourly = resource?.pricingUnit === 'HOUR';

  const phoneDigits = useMemo(
    () => (userInfo?.phone ?? '').replace(/\D/g, '').slice(-10),
    [userInfo?.phone],
  );

  const form = useBookingForm({
    contactName: userInfo?.name ?? '',
    contactPhone: phoneDigits,
    durationDays: '1',
  });

  const createBooking = useCreateUserBookingMutation(resourceId);

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);

    if (!selectedDate) {
      Alert.alert(t('bookings.selectDateTitle'), t('bookings.selectDateRequired'));
      return;
    }

    const duration = parseInt(values.durationDays, 10);
    if (!Number.isFinite(duration) || duration < 1) {
      return;
    }

    if (isHourly && resource?.maxDurationHours != null && duration > resource.maxDurationHours) {
      Alert.alert(
        t('bookings.submitFailedTitle'),
        t('bookings.maxDurationHours', { count: resource.maxDurationHours }),
      );
      return;
    }

    if (!isHourly && resource?.maxDurationDays != null && duration > resource.maxDurationDays) {
      Alert.alert(
        t('bookings.submitFailedTitle'),
        t('bookings.maxDurationDays', { count: resource.maxDurationDays }),
      );
      return;
    }

    let startsAt: string;
    let endsAt: string;
    let durationDays: number | undefined;

    if (isHourly) {
      const start = startOfDay(selectedDate);
      start.setHours(9, 0, 0, 0);
      const end = addHours(start, duration);
      startsAt = start.toISOString();
      endsAt = end.toISOString();
    } else {
      const dayRange = buildDayBookingRange(selectedDate, duration);
      startsAt = dayRange.startsAt;
      endsAt = dayRange.endsAt;
      durationDays = duration;
    }

    try {
      const result = await createBooking.mutateAsync({
        startsAt,
        endsAt,
        durationDays,
        purpose: values.purpose?.trim() || undefined,
        guestCount: values.guestCount?.trim()
          ? parseInt(values.guestCount, 10)
          : undefined,
        notes: values.notes?.trim() || undefined,
        contactName: values.contactName.trim(),
        contactPhone: values.contactPhone.trim(),
      });

      Alert.alert(
        t('bookings.submitSuccessTitle'),
        t('bookings.submitSuccessBody', { id: result.bookingTokenId }),
        [{ text: t('common.ok'), onPress: () => router.back() }],
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : t('bookings.submitFailed');
      setSubmitError(message);
      Alert.alert(t('bookings.submitFailedTitle'), message);
    }
  });

  if (scheduleQuery.isLoading && !scheduleQuery.data) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-4 pb-32 pt-2"
        keyboardShouldPersistTaps="handled"
      >
        {resource ? (
          <Text className="text-foreground text-lg font-bold">{resource.name}</Text>
        ) : null}

        <BookingCalendar
          visibleMonth={visibleMonth}
          onVisibleMonthChange={setVisibleMonth}
          minAdvanceHours={resource?.minAdvanceHours ?? 0}
          bookings={scheduleQuery.data?.bookings ?? []}
          blocks={scheduleQuery.data?.blocks ?? []}
          isLoading={scheduleQuery.isFetching}
          isError={scheduleQuery.isError}
          errorMessage={scheduleQuery.error?.message}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        {selectedDate ? (
          <Text className="text-muted-foreground text-sm">
            {t('bookings.selectedDate', { date: format(selectedDate, 'PPP') })}
          </Text>
        ) : null}

        <View className="rounded-2xl border border-border bg-card p-4">
          <Text className="text-foreground mb-4 text-base font-semibold">
            {t('bookings.formTitle')}
          </Text>
          <BookingCreateForm
            form={form}
            showDurationDays
            durationLabel={
              isHourly ? t('bookings.durationHours') : t('bookings.durationDays')
            }
          />
        </View>

        {submitError ? (
          <Text className="text-destructive text-center text-sm">{submitError}</Text>
        ) : null}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-card px-4 pb-6 pt-3">
        <Button
          className="h-14 rounded-2xl"
          disabled={createBooking.isPending}
          onPress={() => void handleSubmit()}
        >
          {createBooking.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-primary-foreground text-base font-semibold">
              {t('bookings.submitBooking')}
            </Text>
          )}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
