import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { CogIcon, SlidersHorizontalIcon, XIcon } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { Typography } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import { getBookingStatusConfig } from '@/features/bookings/lib/booking-status';
import type { BookingStatus } from '@/features/bookings/types';
import { useStaffAuth } from '@/components/provider/staff-auth-provider';
import { useStaffHomeAnalyticsQuery } from '@/features/tickets/hooks/use-staff-home-analytics-query';
import {
  MonthYearFilter,
} from '@/features/tickets/components/ticket-filter';
import {
  getTicketFilterMonthOptions,
} from '@/features/tickets/hooks/use-tickets-filter';
import {
  countActiveStaffBookingFilters,
  createDefaultStaffBookingsFilter,
  STAFF_BOOKING_FILTER_STATUSES,
  type StaffBookingsFilterSelection,
} from '@/features/staff-bookings/hooks/use-staff-bookings-filter';
import type { StaffBookingsListFilterParams } from '@/features/staff-bookings/types';

type StaffBookingFilterProps = StaffBookingsFilterSelection;

function FilterChipRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-2 py-3">
      <Typography className="text-primary text-xs font-bold uppercase tracking-wide">{label}</Typography>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2 pb-1">{children}</View>
      </ScrollView>
    </View>
  );
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
        'shrink-0 rounded-full border px-3.5 py-2 active:opacity-80',
        selected ? 'border-primary bg-primary/15' : 'border-border bg-muted/40',
      )}>
      <Typography
        className={cn('text-sm font-medium', selected ? 'text-primary' : 'text-foreground')}
        numberOfLines={1}>
        {label}
      </Typography>
    </Pressable>
  );
}

function ResourceFilter({
  resourceId,
  onSelectResource,
}: {
  resourceId: string | null;
  onSelectResource: (id: string | null) => void;
}) {
  const { t } = useTranslation();
  const { staffInfo } = useStaffAuth();
  const analyticsQuery = useStaffHomeAnalyticsQuery({
    wards: staffInfo?.wards ?? [],
  });

  const resources = analyticsQuery.data?.bookingResources ?? [];

  return (
    <FilterChipRow label={t('bookings.staffFilterResource')}>
      {analyticsQuery.isLoading ? (
        <View className="flex-row items-center py-2">
          <ActivityIndicator size="small" />
          <Typography className="text-muted-foreground ml-2 text-sm">{t('bookings.staffLoadingResources')}</Typography>
        </View>
      ) : (
        <>
          <FilterChip
            label={t('common.all')}
            selected={resourceId === null}
            onPress={() => onSelectResource(null)}
          />
          {resources.map((resource) => (
            <FilterChip
              key={resource.id}
              label={resource.title}
              selected={resourceId === resource.id}
              onPress={() => onSelectResource(resource.id)}
            />
          ))}
        </>
      )}
    </FilterChipRow>
  );
}

function BookingStatusFilter({
  status,
  onSelectStatus,
}: {
  status: BookingStatus | null;
  onSelectStatus: (next: BookingStatus | null) => void;
}) {
  const { t } = useTranslation();

  return (
    <FilterChipRow label={t('tickets.filterStatus')}>
      <FilterChip
        label={t('common.all')}
        selected={status === null}
        onPress={() => onSelectStatus(null)}
      />
      {STAFF_BOOKING_FILTER_STATUSES.map((value) => {
        const config = getBookingStatusConfig(value);
        return (
          <FilterChip
            key={value}
            label={t(config.labelKey)}
            selected={status === value}
            onPress={() => onSelectStatus(status === value ? null : value)}
          />
        );
      })}
    </FilterChipRow>
  );
}

function AppliedFilterChip({
  label,
  bgClassName,
  textClassName,
}: {
  label: string;
  bgClassName: string;
  textClassName: string;
}) {
  return (
    <View className={cn('rounded-md px-2 py-0.5', bgClassName)}>
      <Typography className={cn('text-xs font-medium', textClassName)} numberOfLines={1}>
        {label}
      </Typography>
    </View>
  );
}

function StaffBookingFilterSummaryBar({
  filter,
  activeCount,
  onOpenFilters,
}: {
  filter: StaffBookingsListFilterParams;
  activeCount: number;
  onOpenFilters: () => void;
}) {
  const { t } = useTranslation();
  const { staffInfo } = useStaffAuth();
  const analyticsQuery = useStaffHomeAnalyticsQuery({
    wards: staffInfo?.wards ?? [],
  });

  const summaryChips = useMemo(() => {
    const monthLabel =
      getTicketFilterMonthOptions(filter.year).find((m) => m.value === filter.month)?.label ??
      filter.month;

    const chips: { key: string; label: string; bg: string; text: string }[] = [
      {
        key: 'period',
        label: `${monthLabel} ${filter.year}`,
        bg: 'bg-sky-100',
        text: 'text-sky-700',
      },
    ];

    if (filter.resourceId) {
      const resourceName =
        analyticsQuery.data?.bookingResources?.find((r) => r.id === filter.resourceId)?.title ??
        t('bookings.staffFilterResource');
      chips.push({
        key: 'resource',
        label: resourceName,
        bg: 'bg-teal-100',
        text: 'text-teal-800',
      });
    } else {
      chips.push({
        key: 'resource-all',
        label: t('bookings.staffAllResources'),
        bg: 'bg-slate-100',
        text: 'text-slate-700',
      });
    }

    if (filter.status) {
      const config = getBookingStatusConfig(filter.status);
      chips.push({
        key: 'status',
        label: t(config.labelKey),
        bg: config.badgeClass,
        text: config.textClass,
      });
    } else {
      chips.push({
        key: 'status-all',
        label: t('bookings.staffAllStatuses'),
        bg: 'bg-slate-100',
        text: 'text-slate-700',
      });
    }

    return chips;
  }, [filter, analyticsQuery.data?.bookingResources, t]);

  return (
    <View className="flex-row flex-wrap items-center gap-1.5 px-4 pb-2">
      {summaryChips.map((chip) => (
        <AppliedFilterChip
          key={chip.key}
          label={chip.label}
          bgClassName={chip.bg}
          textClassName={chip.text}
        />
      ))}

      <Pressable
        onPress={onOpenFilters}
        accessibilityRole="button"
        accessibilityLabel={
          activeCount > 0
            ? t('tickets.filtersActive', { count: activeCount })
            : t('tickets.openFilters')
        }
        className={cn(
          'shrink-0 flex-row items-center gap-1.5 rounded-full border px-3 py-1.5 active:opacity-80',
          activeCount > 0 ? 'border-primary bg-primary/15' : 'border-border bg-muted/40',
        )}>
        <Icon
          as={SlidersHorizontalIcon}
          className={cn('size-3.5', activeCount > 0 ? 'text-primary' : 'text-muted-foreground')}
        />
        <Typography
          className={cn(
            'text-xs font-semibold',
            activeCount > 0 ? 'text-primary' : 'text-foreground',
          )}>
          {t('tickets.filters')}
        </Typography>
        {activeCount > 0 ? (
          <View className="h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1">
            <Typography className="text-[10px] font-bold text-primary-foreground">{activeCount}</Typography>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

export function StaffBookingFilter({ filter, replaceFilter }: StaffBookingFilterProps) {
  const { t } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [draft, setDraft] = useState(filter);

  const activeCount = useMemo(() => countActiveStaffBookingFilters(filter), [filter]);

  useEffect(() => {
    if (isModalVisible) {
      setDraft(filter);
    }
  }, [isModalVisible, filter]);

  const patchDraft = (changes: Partial<StaffBookingsListFilterParams>) => {
    setDraft((prev) => ({ ...prev, ...changes }));
  };

  const handleClose = () => setIsModalVisible(false);

  const handleResetAll = () => {
    const defaults = createDefaultStaffBookingsFilter();
    setDraft(defaults);
    replaceFilter(defaults);
    setIsModalVisible(false);
  };

  const handleApply = () => {
    replaceFilter(draft);
    setIsModalVisible(false);
  };

  return (
    <>
      <StaffBookingFilterSummaryBar
        filter={filter}
        activeCount={activeCount}
        onOpenFilters={() => setIsModalVisible(true)}
      />

      <Modal
        transparent
        animationType="fade"
        visible={isModalVisible}
        onRequestClose={handleClose}>
        <View className="flex-1 justify-end bg-black/30">
          <Pressable className="flex-1" onPress={handleClose} />
          <View className="absolute bottom-0 h-[60vh] w-full flex-col rounded-t-3xl bg-card">
            <View className="flex-row items-center justify-between px-4 py-3">
              <View className="flex-row items-center gap-2">
                <Icon as={CogIcon} className="size-6 text-primary" />
                <Typography className="text-lg font-bold text-primary">{t('bookings.staffFilterTitle')}</Typography>
              </View>
              <Pressable
                onPress={handleClose}
                className="h-9 w-9 items-center justify-center rounded-full bg-muted">
                <XIcon size={18} color="#737373" />
              </Pressable>
            </View>

            <Separator />

            <ScrollView
              className="flex-1 px-4 pt-3"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              <MonthYearFilter
                month={draft.month}
                year={draft.year}
                onSelectMonth={(m) => patchDraft({ month: m })}
                onSelectYear={(y) => patchDraft({ year: y })}
              />
              <ResourceFilter
                resourceId={draft.resourceId}
                onSelectResource={(id) => patchDraft({ resourceId: id })}
              />
              <BookingStatusFilter
                status={draft.status}
                onSelectStatus={(status) => patchDraft({ status })}
              />
            </ScrollView>

            <Separator />

            <View className="flex-row gap-3 bg-card px-4 py-3">
              <Button variant="outline" className="flex-1" onPress={handleResetAll}>
                <Typography className="font-semibold">{t('common.resetAll')}</Typography>
              </Button>
              <Button variant="default" className="flex-1" onPress={handleApply}>
                <Typography className="font-semibold text-primary-foreground">{t('common.apply')}</Typography>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
