import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import type { LucideIcon } from 'lucide-react-native';
import { ChevronRightIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

type AccountSettingsRowProps = {
  label: string;
  description?: string;
  icon: LucideIcon;
  onPress?: () => void;
  showChevron?: boolean;
};

export function AccountSettingsRow({
  label,
  description,
  icon,
  onPress,
  showChevron = true,
}: AccountSettingsRowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="bg-card border-border flex-row items-center rounded-2xl border px-4 py-3.5 active:opacity-80"
    >
      <View className="bg-primary/10 mr-3 h-10 w-10 items-center justify-center rounded-xl">
        <Icon as={icon} className="text-primary size-5" />
      </View>

      <View className="flex-1">
        <Text className="text-foreground text-base font-semibold">{label}</Text>
        {description ? (
          <Text className="text-muted-foreground mt-0.5 text-sm">{description}</Text>
        ) : null}
      </View>

      {showChevron && onPress ? (
        <Icon as={ChevronRightIcon} className="text-muted-foreground size-5" />
      ) : null}
    </Pressable>
  );
}
