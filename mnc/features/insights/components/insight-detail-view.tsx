import type { UseQueryResult } from '@tanstack/react-query';
import { AlertCircleIcon, CalendarDaysIcon, FileTextIcon, RefreshCcwIcon } from 'lucide-react-native';
import { Linking, Modal, Pressable, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Image } from 'react-native';
import { useState } from 'react';

import { MdxViewer } from '@/components/common/mdx-viewer';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Typography } from '@/components/common/typography';
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
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

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
  const images = item.images ?? [];
  const activeImage = viewerIndex !== null ? images[viewerIndex] : null;

  return (
    <>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-4 py-3 pb-24"
        showsVerticalScrollIndicator={false}
      >
        {images.length > 0 ? (
          <View className="gap-2">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3">
              {images.map((imageUrl, index) => (
                <Pressable
                  key={`${imageUrl}-${index}`}
                  onPress={() => setViewerIndex(index)}
                  className="overflow-hidden rounded-2xl"
                >
                  <Image source={{ uri: imageUrl }} resizeMode="cover" className="h-56 w-80 rounded-2xl" />
                </Pressable>
              ))}
            </ScrollView>
            {images.length > 1 ? (
              <Typography variant="caption" color="muted">
                {images.length} images
              </Typography>
            ) : null}
          </View>
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
          <MdxViewer content={description} />
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
      <Modal
        animationType="fade"
        transparent
        visible={viewerIndex !== null}
        onRequestClose={() => setViewerIndex(null)}
      >
        <View className="flex-1 items-center justify-center bg-black/95 px-4">
          <Pressable className="absolute right-4 top-14 z-10 rounded-full bg-black/60 px-4 py-2" onPress={() => setViewerIndex(null)}>
            <Typography className="text-white">Close</Typography>
          </Pressable>

          {activeImage ? (
            <Image source={{ uri: activeImage }} resizeMode="contain" className="h-[78%] w-full" />
          ) : null}

          {images.length > 1 && viewerIndex !== null ? (
            <View className="mt-4 flex-row items-center justify-center gap-3">
              <Button
                variant="outline"
                onPress={() =>
                  setViewerIndex((prev) => (prev === null ? 0 : (prev - 1 + images.length) % images.length))
                }
              >
                <Typography>Prev</Typography>
              </Button>
              <Typography className="text-white">
                {viewerIndex + 1} / {images.length}
              </Typography>
              <Button
                variant="outline"
                onPress={() =>
                  setViewerIndex((prev) => (prev === null ? 0 : (prev + 1) % images.length))
                }
              >
                <Typography>Next</Typography>
              </Button>
            </View>
          ) : null}
        </View>
      </Modal>
    </>
  );
}
