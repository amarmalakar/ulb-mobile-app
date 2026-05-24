import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import {
  CheckIcon,
  CogIcon,
  FilterIcon,
  RotateCcwIcon,
  XIcon,
} from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import {
  countActiveFeedbackAndSuggestionFilters,
  createDefaultFeedbackAndSuggestionFilter,
  type FeedbackAndSuggestionFilterState,
  type FeedbackSortOrder,
  type FeedbackSubmittedByFilter,
  type FeedbackTypeFilter,
} from '@/features/feedback-and-suggestion-form/hooks/use-feedback-and-suggestion-filters';

export type FeedbackAndSuggestionFiltersProps = {
  filter: FeedbackAndSuggestionFilterState;
  replaceFilter: (filter: FeedbackAndSuggestionFilterState) => void;
};

function FilterChipRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-2 py-3">
      <Text className="text-xs font-bold uppercase tracking-wide text-primary">{label}</Text>
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
      )}
    >
      <Text
        className={cn('text-sm font-medium', selected ? 'text-primary' : 'text-foreground')}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function TypeFilter({
  value,
  onChange,
}: {
  value: FeedbackTypeFilter;
  onChange: (value: FeedbackTypeFilter) => void;
}) {
  const { t } = useTranslation();
  const options: { value: FeedbackTypeFilter; label: string }[] = [
    { value: 'ALL', label: t('common.all') },
    { value: 'FEEDBACK', label: t('feedback.kindFeedback') },
    { value: 'SUGGESTION', label: t('feedback.kindSuggestion') },
  ];

  return (
    <FilterChipRow label={t('feedback.filters.typeLabel')}>
      {options.map((opt) => (
        <FilterChip
          key={opt.value}
          label={opt.label}
          selected={value === opt.value}
          onPress={() => onChange(opt.value)}
        />
      ))}
    </FilterChipRow>
  );
}

function SubmittedByFilter({
  value,
  onChange,
}: {
  value: FeedbackSubmittedByFilter;
  onChange: (value: FeedbackSubmittedByFilter) => void;
}) {
  const { t } = useTranslation();
  const options: { value: FeedbackSubmittedByFilter; label: string }[] = [
    { value: 'ALL', label: t('common.all') },
    { value: 'STAFF', label: t('feedback.filters.submittedByStaff') },
    { value: 'USER', label: t('feedback.filters.submittedByUser') },
    { value: 'YOURS', label: t('feedback.filters.submittedByYours') },
  ];

  return (
    <FilterChipRow label={t('feedback.filters.submittedByLabel')}>
      {options.map((opt) => (
        <FilterChip
          key={opt.value}
          label={opt.label}
          selected={value === opt.value}
          onPress={() => onChange(opt.value)}
        />
      ))}
    </FilterChipRow>
  );
}

function SortByDateFilter({
  value,
  onChange,
}: {
  value: FeedbackSortOrder;
  onChange: (value: FeedbackSortOrder) => void;
}) {
  const { t } = useTranslation();
  const options: { value: FeedbackSortOrder; label: string }[] = [
    { value: 'DESC', label: t('feedback.filters.sortNewest') },
    { value: 'ASC', label: t('feedback.filters.sortOldest') },
  ];

  return (
    <FilterChipRow label={t('feedback.filters.sortByDate')}>
      {options.map((opt) => (
        <FilterChip
          key={opt.value}
          label={opt.label}
          selected={value === opt.value}
          onPress={() => onChange(opt.value)}
        />
      ))}
    </FilterChipRow>
  );
}

export function FeedbackAndSuggestionFilters({
  filter,
  replaceFilter,
}: FeedbackAndSuggestionFiltersProps) {
  const { t } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [draft, setDraft] = useState(filter);

  const activeCount = useMemo(
    () => countActiveFeedbackAndSuggestionFilters(filter),
    [filter],
  );

  useEffect(() => {
    if (isModalVisible) {
      setDraft(filter);
    }
  }, [isModalVisible, filter]);

  const patchDraft = (changes: Partial<FeedbackAndSuggestionFilterState>) => {
    setDraft((prev) => ({ ...prev, ...changes }));
  };

  const handleClose = () => setIsModalVisible(false);

  const handleReset = () => {
    const defaults = createDefaultFeedbackAndSuggestionFilter();
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
      <Pressable
        onPress={() => setIsModalVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={
          activeCount > 0
            ? t('feedback.filters.active', { count: activeCount })
            : t('feedback.filters.open')
        }
        className={cn(
          'self-start flex-row items-center gap-1.5 rounded-full border px-3 py-2 active:opacity-80',
          activeCount > 0 ? 'border-primary bg-primary/15' : 'border-primary bg-background',
        )}
      >
        <Icon
          as={FilterIcon}
          className={cn('size-4', activeCount > 0 ? 'text-primary' : 'text-primary')}
        />
        <Text className="text-sm font-semibold text-primary">{t('feedback.filters.title')}</Text>
        {activeCount > 0 ? (
          <View className="h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1">
            <Text className="text-[10px] font-bold text-primary-foreground">{activeCount}</Text>
          </View>
        ) : null}
      </Pressable>

      <Modal
        transparent
        animationType="fade"
        visible={isModalVisible}
        onRequestClose={handleClose}
      >
        <View className="flex-1 justify-end bg-black/30">
          <Pressable className="flex-1" onPress={handleClose} accessibilityLabel={t('common.close')} />
          <View className="absolute bottom-0 max-h-[70vh] w-full flex-col rounded-t-3xl bg-card">
            <View className="flex-row items-center justify-between px-4 py-3">
              <View className="flex-row items-center gap-2">
                <Icon as={CogIcon} className="size-6 text-primary" />
                <Text className="text-lg font-bold text-primary">{t('feedback.filters.modalTitle')}</Text>
              </View>
              <Pressable
                onPress={handleClose}
                className="h-9 w-9 items-center justify-center rounded-full bg-muted"
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
              >
                <XIcon size={18} color="#737373" />
              </Pressable>
            </View>

            <Separator />

            <ScrollView
              className="flex-shrink px-4 pt-1"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <TypeFilter value={draft.type} onChange={(type) => patchDraft({ type })} />
              <SubmittedByFilter
                value={draft.submittedBy}
                onChange={(submittedBy) => patchDraft({ submittedBy })}
              />
              <SortByDateFilter
                value={draft.sortOrder}
                onChange={(sortOrder) => patchDraft({ sortOrder })}
              />
            </ScrollView>

            <Separator />

            <View className="flex-row gap-3 bg-card px-4 py-3">
              <Button variant="outline" className="flex-1 flex-row gap-2" onPress={handleReset}>
                <Icon as={RotateCcwIcon} className="size-4 text-foreground" />
                <Text className="font-semibold">{t('feedback.filters.reset')}</Text>
              </Button>
              <Button variant="default" className="flex-1 flex-row gap-2" onPress={handleApply}>
                <Icon as={CheckIcon} className="size-4 text-primary-foreground" />
                <Text className="font-semibold text-primary-foreground">{t('common.apply')}</Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
