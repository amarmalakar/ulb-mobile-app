import { Pressable, View } from 'react-native';
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
import { cn } from '@/lib/utils';

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

function ServiceItem({ service }: { service: UserService }) {
  const router = useRouter();
  const ServiceIcon = resolveServiceIcon(service.icon);

  return (
    <View className="w-1/4">
      <Pressable
        className="self-center items-center gap-2 active:opacity-80"
        onPress={() => router.push({
          pathname: '/user/service-form-screen',
          params: {
            params: JSON.stringify({
              serviceId: service.id,
              serviceTitle: service.title,
              subServicesArray: service.subServices
            })
          },
        })}
      >
        <View
          className={cn(
            'h-14 w-14 items-center justify-center rounded-full border',
            getServiceColorClass('border', service.color, 200),
            getServiceColorClass('bg', service.color, 100),
          )}
        >
          <Icon
            as={ServiceIcon}
            className={getServiceColorClass('text', service.color, 600)}
            size={24}
          />
        </View>
        <Typography className="text-center text-foreground text-sm font-medium">
          {getLocaleString(service.title)}
        </Typography>
      </Pressable>
    </View>
  );
}

export default function ServiceList() {
  const { t } = useTranslation();
  const { isLoading, isError, error, refetch, data: services } = useUserServicesQuery();

  if (isLoading) {
    return (
      <View className="gap-4 p-4">
        <Skeleton className="h-6 w-56" />
        <View className="flex-row flex-wrap gap-y-4">
          {new Array(7).fill(0).map((_, index) => (
            <View key={index} className="w-1/4">
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
      <View className="gap-4 p-4">
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
    <View className="gap-4 p-4">
      <Typography variant="h4" className="text-primary">
        {t('services.title')}
      </Typography>
      {items.length === 0 ? (
        <Typography className="text-muted-foreground text-sm">{t('complaints.empty')}</Typography>
      ) : (
        <View className="flex-row flex-wrap gap-y-4">
          {items.map((item) => {
            return (
              <ServiceItem key={item.id} service={item} />
            )
          })}
        </View>
      )}
    </View>
  );
}