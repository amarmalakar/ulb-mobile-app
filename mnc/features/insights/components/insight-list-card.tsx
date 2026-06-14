import { Image, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Typography } from '@/components/common/typography';
import { cn } from '@/lib/utils';
import { CalendarDaysIcon } from 'lucide-react-native';

import { formatInsightDateRange, getInsightSubtitle, getInsightTitle, insightTypeTone } from '../lib/insight-utils';
import type { V2InsightItem } from '../types';

type InsightListCardProps = {
  item: V2InsightItem;
  onPress: (id: string) => void;
};

export function InsightListCard({ item, onPress }: InsightListCardProps) {
  const { i18n } = useTranslation();
  const imageUrl = item.images[0];
  const title = getInsightTitle(item, i18n.resolvedLanguage);
  const subtitle = getInsightSubtitle(item, i18n.resolvedLanguage);
  const dateRange = formatInsightDateRange(item.startDate, item.endDate);

  return (
    <Pressable
      onPress={() => onPress(item.id)}
      className="overflow-hidden rounded-2xl border border-border bg-card active:opacity-90"
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} resizeMode="cover" className="h-44 w-full" />
      ) : (
        <View className="h-28 items-center justify-center bg-muted">
          <Typography color="muted">No image</Typography>
        </View>
      )}

      <View className="gap-2 p-4">
        <View className="flex-row items-center justify-between gap-2">
          <View className={cn('rounded-full px-3 py-1', insightTypeTone(item.type))}>
            <Typography className="text-xs font-semibold">{item.type}</Typography>
          </View>
          {dateRange ? (
            <View className="flex-row items-center gap-1">
              <CalendarDaysIcon size={14} color="#94A3B8" />
              <Typography variant="caption" color="muted">
                {dateRange}
              </Typography>
            </View>
          ) : null}
        </View>

        <Typography className="text-base font-bold text-foreground">{title}</Typography>
        {subtitle ? (
          <Typography className="text-sm leading-5 text-muted-foreground" numberOfLines={2}>
            {subtitle}
          </Typography>
        ) : null}
      </View>
    </Pressable>
  );
}
