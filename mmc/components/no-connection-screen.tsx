import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useTranslation } from 'react-i18next';
import NetInfo from '@react-native-community/netinfo';
import { WifiOffIcon } from 'lucide-react-native';
import { View } from 'react-native';

type NoConnectionScreenProps = {
  onRetry?: () => void;
};

export function NoConnectionScreen({ onRetry }: NoConnectionScreenProps) {
  const { t } = useTranslation();

  async function handleRetry() {
    await NetInfo.refresh();
    onRetry?.();
  }

  return (
    <View className="flex-1 items-center justify-center gap-6 bg-background px-6">
      <View className="bg-muted items-center justify-center rounded-full p-5">
        <Icon as={WifiOffIcon} className="text-muted-foreground size-10" />
      </View>
      <View className="items-center gap-2">
        <Text variant="h3" className="text-center">
          {t('network.title')}
        </Text>
        <Text variant="muted" className="text-center">
          {t('network.hint')}
        </Text>
      </View>
      <Button onPress={handleRetry}>
        <Text>{t('common.tryAgain')}</Text>
      </Button>
    </View>
  );
}
