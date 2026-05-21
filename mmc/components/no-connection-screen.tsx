import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import NetInfo from '@react-native-community/netinfo';
import { WifiOffIcon } from 'lucide-react-native';
import { View } from 'react-native';

type NoConnectionScreenProps = {
  onRetry?: () => void;
};

export function NoConnectionScreen({ onRetry }: NoConnectionScreenProps) {
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
          No internet connection
        </Text>
        <Text variant="muted" className="text-center">
          Check your connection and try again.
        </Text>
      </View>
      <Button onPress={handleRetry}>
        <Text>Try again</Text>
      </Button>
    </View>
  );
}
