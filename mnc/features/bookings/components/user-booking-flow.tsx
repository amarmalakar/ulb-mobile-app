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
import {
  AlertCircleIcon,
  RefreshCcwIcon,
  SearchXIcon,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Typography } from '@/components/common/typography';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserBookingResourceScheduleQuery } from '@/features/bookings/hooks/use-user-booking-resource-schedule-query';
import { buildDayBookingRange, monthScheduleRange } from '@/features/bookings/lib/booking-date-utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookingCalendar } from './booking-calendar';
import { BookingCreateForm } from './booking-create-form';
import { useUserAuth } from '@/components/providers/user-auth-provider';
import { useBookingForm } from '../hooks/use-booking-form';
import { useSendBookingEnquiryMutation } from '../hooks/use-send-booking-enquiry-mutation';
import { useRouter } from 'expo-router';

function BookingFlowSkeleton() {
  return (
    <View className="gap-5 px-4 pb-4 pt-2">
      <Skeleton className="h-7 w-2/3" />

      <View className="gap-3 rounded-2xl border border-border bg-card p-4">
        <Skeleton className="h-5 w-28" />
        <View className="flex-row items-center justify-between">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </View>
        <View className="flex-row flex-wrap gap-1">
          {Array.from({ length: 35 }).map((_, index) => (
            <View key={index} className="aspect-square w-[14.28%] items-center justify-center p-0.5">
              <Skeleton className="h-9 w-9 rounded-full" />
            </View>
          ))}
        </View>
        <View className="mt-2 flex-row gap-3">
          <Skeleton className="h-3 w-20 rounded-full" />
          <Skeleton className="h-3 w-20 rounded-full" />
          <Skeleton className="h-3 w-20 rounded-full" />
        </View>
      </View>

      <View className="gap-4 rounded-2xl border border-border bg-card p-4">
        <Skeleton className="h-5 w-32" />
        <View className="flex-row gap-3">
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 flex-1 rounded-xl" />
        </View>
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </View>
    </View>
  );
}

function BookingFlowError({
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

function BookingFlowNotFound() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center gap-5 px-6 py-12">
      <View className="bg-muted size-20 items-center justify-center rounded-full">
        <Icon as={SearchXIcon} className="text-muted-foreground" size={40} />
      </View>
      <View className="gap-1.5">
        <Typography className="text-foreground text-center text-xl font-bold">
          {t('bookings.notFound')}
        </Typography>
      </View>
    </View>
  );
}

export function UserBookingFlow({ resourceId }: { resourceId: string }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { userInfo } = useUserAuth();

  const range = useMemo(() => monthScheduleRange(visibleMonth), [visibleMonth]);
  const scheduleQuery = useUserBookingResourceScheduleQuery({
    resourceId,
    from: range.from,
    to: range.to,
  });

  const resource = scheduleQuery.data?.resource;
  const isHourly = resource?.pricingUnit === 'HOUR';

  const defaultContact = useMemo(() => {
    const phoneDigits = (userInfo?.phone ?? '').replace(/\D/g, '').slice(-10);
    return {
      contactName: userInfo?.name ?? '',
      contactPhone: phoneDigits,
    };
  }, [userInfo?.name, userInfo?.phone]);

  const form = useBookingForm({
    contactName: defaultContact.contactName,
    contactPhone: defaultContact.contactPhone,
    durationDays: '1',
  });

  const sendBookingEnquiry = useSendBookingEnquiryMutation(resourceId);

  const [submitError, setSubmitError] = useState<string | null>(null);


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
      const result = await sendBookingEnquiry.mutateAsync({
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

      const onSuccessNavigate = () => {
        router.replace({
          pathname: '/user/booking-detail-screen',
          params: { bookingId: result.id },
        });
      };

      Alert.alert(
        t('bookings.submitSuccessTitle'),
        t('bookings.submitSuccessBody', { id: result.bookingTokenId }),
        [{ text: t('common.ok'), onPress: onSuccessNavigate }],
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : t('bookings.submitFailed');
      setSubmitError(message);
      Alert.alert(t('bookings.submitFailedTitle'), message);
    }
  });

  if (scheduleQuery.isLoading && !scheduleQuery.data) {
    return <BookingFlowSkeleton />
  }

  if (scheduleQuery.isError && !scheduleQuery.data) {
    return <BookingFlowError message={scheduleQuery.error?.message} onRetry={() => void scheduleQuery.refetch()} />
  }

  if (!resource) {
    return <BookingFlowNotFound />
  }

  return (
    <View className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerClassName="gap-5 px-4 pb-4 pt-2"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <Typography variant="h5" className='text-primary'>{resource.name}</Typography>

          <BookingCalendar
            visibleMonth={visibleMonth}
            onVisibleMonthChange={setVisibleMonth}
            minAdvanceHours={resource.minAdvanceHours}
            bookings={scheduleQuery.data?.bookings ?? []}
            blocks={scheduleQuery.data?.blocks ?? []}
            isLoading={scheduleQuery.isFetching}
            isError={scheduleQuery.isError}
            errorMessage={
              scheduleQuery.isError ? scheduleQuery.error?.message : undefined
            }
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />

          {selectedDate ? (
            <Typography variant="caption">
              {t('bookings.selectedDate', { date: format(selectedDate, 'PPP') })}
            </Typography>
          ) : null}

          <View className="rounded-2xl border border-border bg-card p-4">
            {/* <Typography variant="h6" className="text-primary">
              {t('bookings.formTitle')}
            </Typography> */}

            <BookingCreateForm
              form={form}
              showDurationDays
              durationLabel={
                isHourly ? t('bookings.durationHours') : t('bookings.durationDays')
              }
            />
          </View>
        </ScrollView>

        <View
          className="border-t border-border bg-card px-4 pb-6 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 12), elevation: 14 }}
        >
          <Button
            className="h-14 rounded-2xl"
            disabled={sendBookingEnquiry.isPending}
            onPress={() => void handleSubmit()}
          >
            {sendBookingEnquiry.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Typography className="text-base font-semibold text-primary-foreground">
                {t('bookings.submitBooking')}
              </Typography>
            )}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
