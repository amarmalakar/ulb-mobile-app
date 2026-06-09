import { useMemo } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Icon } from '@/components/ui/icon';
import { Typography } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import {
  isDayBeforeMinAdvance,
  isDayUnavailable,
} from '@/features/bookings/lib/booking-date-utils';
import type {
  UserResourceScheduleBlock,
  UserResourceScheduleOccupancy,
} from '@/features/bookings/types';

const WEEKDAY_KEYS = [
  'bookings.weekSun',
  'bookings.weekMon',
  'bookings.weekTue',
  'bookings.weekWed',
  'bookings.weekThu',
  'bookings.weekFri',
  'bookings.weekSat',
] as const;

type BookingCalendarProps = {
  visibleMonth: Date;
  onVisibleMonthChange: (month: Date) => void;
  minAdvanceHours: number;
  bookings: UserResourceScheduleOccupancy[];
  blocks: UserResourceScheduleBlock[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
};

export function BookingCalendar({
  visibleMonth,
  onVisibleMonthChange,
  minAdvanceHours,
  bookings,
  blocks,
  isLoading,
  isError,
  errorMessage,
  selectedDate,
  onSelectDate,
}: BookingCalendarProps) {
  const { t } = useTranslation();

  const monthDays = useMemo(() => {
    const start = startOfMonth(visibleMonth);
    const end = endOfMonth(visibleMonth);
    const days = eachDayOfInterval({ start, end });
    const padStart = start.getDay();
    return { days, padStart };
  }, [visibleMonth]);

  const canGoPrev = visibleMonth > startOfMonth(new Date());

  return (
    <View className="rounded-2xl border border-border bg-card p-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Typography className="text-base font-semibold text-foreground">{t('bookings.selectDate')}</Typography>
        {isLoading ? <ActivityIndicator size="small" /> : null}
      </View>

      <View className="mb-3 flex-row items-center justify-between">
        <Pressable
          disabled={!canGoPrev}
          onPress={() => onVisibleMonthChange(subMonths(visibleMonth, 1))}
          className={cn('h-9 w-9 items-center justify-center rounded-full bg-muted', !canGoPrev && 'opacity-40')}
        >
          <Icon as={ChevronLeftIcon} className="size-5" />
        </Pressable>
        <Typography className="text-base font-bold text-foreground">{format(visibleMonth, 'MMMM yyyy')}</Typography>
        <Pressable
          onPress={() => onVisibleMonthChange(addMonths(visibleMonth, 1))}
          className="h-9 w-9 items-center justify-center rounded-full bg-muted"
        >
          <Icon as={ChevronRightIcon} className="size-5" />
        </Pressable>
      </View>

      <View className="mb-1 flex-row">
        {WEEKDAY_KEYS.map((key) => (
          <View key={key} className="flex-1 items-center py-1">
            <Typography className="text-muted-foreground text-xs font-medium">{t(key)}</Typography>
          </View>
        ))}
      </View>

      {isError ? (
        <Typography className="text-destructive py-4 text-center text-sm">{errorMessage}</Typography>
      ) : (
        <View className="flex-row flex-wrap">
          {Array.from({ length: monthDays.padStart }).map((_, i) => (
            <View key={`pad-${i}`} className="aspect-square w-[14.28%]" />
          ))}
          {monthDays.days.map((day) => {
            const isOccupied = isDayUnavailable(day, bookings, blocks);
            const isBeforeMinAdvance = isDayBeforeMinAdvance(day, minAdvanceHours);
            const isBookable = !isOccupied && !isBeforeMinAdvance;
            const selected = selectedDate ? isSameDay(day, selectedDate) : false;
            const inMonth = isSameMonth(day, visibleMonth);

            return (
              <Pressable
                key={day.toISOString()}
                disabled={!isBookable || !inMonth}
                onPress={() => onSelectDate(day)}
                className="aspect-square w-[14.28%] items-center justify-center p-0.5"
              >
                <View
                  className={cn(
                    'h-9 w-9 items-center justify-center rounded-full',
                    selected && 'bg-primary',
                    !selected && isOccupied && 'bg-destructive/15',
                    !selected && isBookable && 'bg-emerald-50',
                  )}
                >
                  <Typography
                    className={cn(
                      'text-sm font-medium',
                      selected && 'text-primary-foreground',
                      !selected && isOccupied && 'text-destructive',
                      !selected && isBookable && 'text-foreground',
                      !selected && !isOccupied && !isBookable && 'text-muted-foreground',
                    )}
                  >
                    {format(day, 'd')}
                  </Typography>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      <View className="mt-4 flex-row flex-wrap gap-3">
        <View className="flex-row items-center gap-1.5">
          <View className="bg-emerald-50 h-3 w-3 rounded-full border border-emerald-200" />
          <Typography className="text-muted-foreground text-xs">{t('bookings.legendAvailable')}</Typography>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="bg-destructive/15 h-3 w-3 rounded-full" />
          <Typography className="text-muted-foreground text-xs">{t('bookings.legendBooked')}</Typography>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="bg-primary h-3 w-3 rounded-full" />
          <Typography className="text-muted-foreground text-xs">{t('bookings.legendSelected')}</Typography>
        </View>
      </View>
    </View>
  );
}
