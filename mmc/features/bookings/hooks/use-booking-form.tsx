import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { MOBILE_NUMBER_LENGTH } from '@/features/user-auth/constants';
import { i18n } from '@/lib/i18n';

function createBookingFormSchema() {
  const phoneField = z
    .string()
    .length(MOBILE_NUMBER_LENGTH, i18n.t('bookings.validation.phoneLength'))
    .regex(/^[6-9]\d{9}$/, i18n.t('bookings.validation.phoneInvalid'));

  return z.object({
    contactName: z
      .string()
      .trim()
      .min(1, i18n.t('bookings.validation.nameRequired'))
      .max(120, i18n.t('bookings.validation.nameTooLong')),
    contactPhone: phoneField,
    durationDays: z
      .string()
      .trim()
      .min(1, i18n.t('bookings.validation.durationRequired'))
      .regex(/^\d+$/, i18n.t('bookings.validation.durationInvalid'))
      .refine((s) => {
        const n = parseInt(s, 10);
        return n >= 1 && n <= 365;
      }, i18n.t('bookings.validation.durationRange')),
    purpose: z.string().trim().max(500).optional(),
    guestCount: z
      .string()
      .trim()
      .optional()
      .refine((s) => !s || /^\d+$/.test(s), i18n.t('bookings.validation.guestCountInvalid')),
    notes: z.string().trim().max(2000).optional(),
  });
}

export type BookingFormValues = z.infer<ReturnType<typeof createBookingFormSchema>>;

export function useBookingForm(defaults?: Partial<BookingFormValues>) {
  const schema = useMemo(() => createBookingFormSchema(), [i18n.language]);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      contactName: defaults?.contactName ?? '',
      contactPhone: defaults?.contactPhone ?? '',
      durationDays: defaults?.durationDays ?? '1',
      purpose: defaults?.purpose ?? '',
      guestCount: defaults?.guestCount ?? '',
      notes: defaults?.notes ?? '',
    },
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (!defaults) return;
    if (defaults.contactName) form.setValue('contactName', defaults.contactName);
    if (defaults.contactPhone) form.setValue('contactPhone', defaults.contactPhone);
  }, [defaults?.contactName, defaults?.contactPhone, form]);

  return form;
}
