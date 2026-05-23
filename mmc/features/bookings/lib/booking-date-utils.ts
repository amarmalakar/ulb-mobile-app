import {
  addDays,
  endOfDay,
  endOfMonth,
  isBefore,
  startOfDay,
  startOfMonth,
} from 'date-fns';

import type {
  UserResourceScheduleBlock,
  UserResourceScheduleOccupancy,
} from '@/features/bookings/types';

function rangesOverlap(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return startA < endB && endA > startB;
}

/** True when any booking/block overlaps this calendar day. */
export function isDayUnavailable(
  day: Date,
  bookings: UserResourceScheduleOccupancy[],
  blocks: UserResourceScheduleBlock[],
): boolean {
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);

  const occupied = [...bookings, ...blocks].some((item) =>
    rangesOverlap(dayStart, dayEnd, new Date(item.startsAt), new Date(item.endsAt)),
  );

  return occupied;
}

/** Earliest allowed start (min advance notice). */
export function getMinBookableDate(minAdvanceHours: number): Date {
  return new Date(Date.now() + minAdvanceHours * 60 * 60 * 1000);
}

export function isDayBeforeMinAdvance(day: Date, minAdvanceHours: number): boolean {
  const minDate = getMinBookableDate(minAdvanceHours);
  return isBefore(endOfDay(day), startOfDay(minDate));
}

export function buildDayBookingRange(
  startDay: Date,
  durationDays: number,
): { startsAt: string; endsAt: string } {
  const startsAt = startOfDay(startDay);
  const lastDay = addDays(startDay, Math.max(1, durationDays) - 1);
  const endsAt = endOfDay(lastDay);
  return {
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
  };
}

export function monthScheduleRange(month: Date): { from: string; to: string } {
  const from = startOfMonth(month);
  const to = endOfMonth(month);
  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}
