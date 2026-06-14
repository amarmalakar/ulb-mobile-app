import { Typography } from '@/components/common/typography';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { AlertCircleIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

type AppErrorScreenProps = {
  message?: string;
  onRetry?: () => void;
};

export function AppErrorScreen({ message, onRetry }: AppErrorScreenProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center gap-6 bg-background px-6">
      <View className="items-center justify-center rounded-full bg-destructive/10 p-5">
        <Icon as={AlertCircleIcon} className="size-10 text-destructive" />
      </View>
      <View className="items-center gap-2">
        <Typography variant="h3" align="center">
          {t('common.errorTitle')}
        </Typography>
        <Typography variant="body2" color="muted" align="center">
          {message?.trim() || t('appInit.errorHint')}
        </Typography>
      </View>
      {onRetry ? (
        <Button onPress={onRetry}>
          <Typography color="primary-foreground">{t('common.tryAgain')}</Typography>
        </Button>
      ) : null}
    </View>
  );
}
