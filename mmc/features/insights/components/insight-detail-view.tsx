import type { UseQueryResult } from '@tanstack/react-query';
import { AlertCircleIcon, CalendarDaysIcon, FileTextIcon, RefreshCcwIcon } from 'lucide-react-native';
import { Linking, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Image } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Typography } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

import {
  formatInsightDateRange,
  getInsightSubtitle,
  getInsightTitle,
  getLocalizedInsightText,
  insightTypeTone,
} from '../lib/insight-utils';
import type { V2InsightItem } from '../types';

function DetailSkeleton() {
  return (
    <View className="gap-4 px-4 py-3">
      <Skeleton className="h-56 w-full rounded-2xl" />
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-8 w-5/6" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-4/5" />
    </View>
  );
}

function DetailError({ message, onRetry }: { message?: string; onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center gap-4 px-6 py-12">
      <View className="size-20 items-center justify-center rounded-full bg-destructive/10">
        <Icon as={AlertCircleIcon} className="text-destructive" size={40} />
      </View>
      <View className="gap-1.5">
        <Typography className="text-center text-lg font-bold text-destructive">
          {t('common.errorTitle')}
        </Typography>
        <Typography className="text-center text-sm text-muted-foreground">
          {message ?? t('insights.loadError')}
        </Typography>
      </View>
      <Button size="sm" variant="outline" onPress={onRetry}>
        <Icon as={RefreshCcwIcon} className="size-4" />
        <Typography>{t('common.retry')}</Typography>
      </Button>
    </View>
  );
}

function DetailNotFound() {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <Typography className="text-center text-sm text-muted-foreground">
        {t('insights.notFound')}
      </Typography>
    </View>
  );
}

export function InsightDetailView({
  query,
  insightId,
}: {
  query: UseQueryResult<V2InsightItem[], Error>;
  insightId: string | undefined;
}) {
  const { t, i18n } = useTranslation();
  const { data, isLoading, isError, error, refetch, isRefetching } = query;

  if (isLoading || isRefetching) {
    return <DetailSkeleton />;
  }

  if (isError) {
    return <DetailError message={error?.message} onRetry={() => void refetch()} />;
  }

  const item = data?.find((entry) => entry.id === insightId);
  if (!item) {
    return <DetailNotFound />;
  }

  const title = getInsightTitle(item, i18n.resolvedLanguage);
  const subtitle = getInsightSubtitle(item, i18n.resolvedLanguage);
  const dateRange = formatInsightDateRange(item.startDate, item.endDate);
  const description = getLocalizedInsightText(item.description, i18n.resolvedLanguage);

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-4 px-4 py-3 pb-8"
      showsVerticalScrollIndicator={false}
    >
      {item.images[0] ? (
        <Image source={{ uri: item.images[0] }} resizeMode="cover" className="h-56 w-full rounded-2xl" />
      ) : null}

      <View className={cn('self-start rounded-full px-3 py-1', insightTypeTone(item.type))}>
        <Typography className="text-xs font-semibold">{item.type}</Typography>
      </View>

      <Typography className="text-2xl font-extrabold text-foreground">{title}</Typography>
      {subtitle ? (
        <Typography className="text-base text-muted-foreground">{subtitle}</Typography>
      ) : null}

      {dateRange ? (
        <View className="flex-row items-center gap-2">
          <CalendarDaysIcon size={16} color="#94A3B8" />
          <Typography className="text-sm text-muted-foreground">{dateRange}</Typography>
        </View>
      ) : null}

      {description ? (
        <Typography className="text-base leading-7 text-foreground">{description}</Typography>
      ) : null}

      {item.fileUrl.length > 0 ? (
        <View className="gap-2">
          <Typography className="text-sm font-semibold text-foreground">{t('insights.attachments')}</Typography>
          {item.fileUrl.map((url) => (
            <Button
              key={url}
              variant="outline"
              className="justify-start"
              onPress={() => {
                void Linking.openURL(url);
              }}
            >
              <Icon as={FileTextIcon} className="size-4 text-foreground" />
              <Typography className="ml-2 flex-1 text-left">{t('insights.openAttachment')}</Typography>
            </Button>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}
