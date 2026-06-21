import { FlatList, Pressable, useWindowDimensions, View } from 'react-native';
import { Typography } from '@/components/common/typography';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useUserServicesQuery } from '@/features/service/hooks/use-user-services-query';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/icon';
import { AlertCircleIcon, RefreshCcwIcon } from 'lucide-react-native';
import { UserService } from '../types';
import { useRouter } from 'expo-router';
import { getServiceColorClass } from '@/lib/get-service-color-class';
import { resolveServiceIcon } from '@/features/service/lib/resolve-service-icon';
import { getLocaleString } from '@/lib/i18n/get-locale-string';
import { resolveTicketImageUrl } from '@/lib/resolve-ticket-image-url';
import { cn } from '@/lib/utils';
import { Image } from 'expo-image';

const NUM_COLUMNS = 4;
const COLUMN_GAP = 10;
const LIST_HORIZONTAL_PADDING = 16;

function ServiceError({
  onRetry,
  message,
  title,
  retryLabel,
  defaultMessage,
}: {
  onRetry: () => void;
  message?: string;
  title: string;
  retryLabel: string;
  defaultMessage: string;
}) {
  return (
    <View className="items-center gap-4 px-4 py-8">
      <View className="bg-destructive/10 size-16 items-center justify-center rounded-full">
        <Icon as={AlertCircleIcon} className="text-destructive" size={32} />
      </View>
      <View className="gap-1.5">
        <Typography className="text-destructive text-center text-base font-bold">{title}</Typography>
        <Typography className="text-muted-foreground text-center text-sm">
          {message ?? defaultMessage}
        </Typography>
      </View>
      <Button size="sm" variant="outline" onPress={onRetry}>
        <Icon as={RefreshCcwIcon} className="size-4" />
        <Typography>{retryLabel}</Typography>
      </Button>
    </View>
  );
}

export default function ServiceList() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isLoading, isError, error, refetch, data: services } = useUserServicesQuery();
  const { width: screenWidth } = useWindowDimensions();
  const itemWidth = (screenWidth - LIST_HORIZONTAL_PADDING - COLUMN_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

  if (isLoading) {
    return (
      <View className="gap-4 py-4 px-2">
        <Skeleton className="h-6 w-56" />
        <View className="flex-row flex-wrap" style={{ gap: COLUMN_GAP, rowGap: 20 }}>
          {new Array(7).fill(0).map((_, index) => (
            <View key={index} style={{ width: itemWidth }}>
              <View className="self-center items-center gap-2">
                <Skeleton className="h-14 w-14 items-center justify-center rounded-full" />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="gap-4 py-4 px-2">
        <Typography variant="h4" className="text-primary">{t('complaints.title')}</Typography>
        <ServiceError
          onRetry={() => void refetch()}
          message={error?.message}
          title={t('common.errorTitle')}
          retryLabel={t('common.retry')}
          defaultMessage={t('common.errorDefault')}
        />
      </View>
    );
  }

  const items = services ?? [];

  return (
    <View className="gap-4 py-4 px-2">
      <Typography variant="h4" className="text-primary">
        {t('services.title')}
      </Typography>
      {items.length === 0 ? (
        <Typography className="text-muted-foreground text-sm">{t('complaints.empty')}</Typography>
      ) : (
        <FlatList
          data={items}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const iconImageUrl = item.iconPathname
              ? resolveTicketImageUrl(item.iconPathname)
              : '';
            const ServiceIcon = resolveServiceIcon(item.icon);

            return (
              <View style={{ width: itemWidth }}>
                <Pressable
                  className={cn(
                    "self-center items-center gap-2 border border-primary rounded-lg aspect-square w-full overflow-hidden",
                    ""
                  )}
                  onPress={() => router.push({
                    pathname: '/user/service-form-screen',
                    params: {
                      params: JSON.stringify({
                        serviceId: item.id,
                        serviceTitle: item.title,
                        subServicesArray: item.subServices
                      })
                    },
                  })}
                >
                  <View className="aspect-square w-full items-center justify-center bg-primary/10 p-2.5 shadow-sm">
                    {iconImageUrl ? (
                      <Image
                        source={{ uri: iconImageUrl }}
                        style={{ width: '60%', height: '60%' }}
                        contentFit="contain"
                        accessibilityLabel={getLocaleString(item.title)}
                      />
                    ) : (
                      <Icon
                        as={ServiceIcon}
                        className={getServiceColorClass('text', item.color, 600)}
                        size={28}
                      />
                    )}
                  </View>
                </Pressable>

                <Typography className="text-center text-foreground text-xs font-medium pt-2">
                  {getLocaleString(item.title)}
                </Typography>
              </View>
            )
          }}
          keyExtractor={(item) => item.id}
          numColumns={NUM_COLUMNS}
          columnWrapperStyle={{ gap: COLUMN_GAP }}
          contentContainerStyle={{ gap: 20 }}
        />
      )}
    </View>
  );
}