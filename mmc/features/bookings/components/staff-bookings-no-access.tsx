import { ShieldX } from 'lucide-react-native';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

export function StaffBookingsNoAccess() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center gap-5 px-8 py-12">
      <View className="size-20 items-center justify-center rounded-full border border-rose-200 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/40">
        <Icon as={ShieldX} className="text-rose-600 dark:text-rose-400" size={40} />
      </View>
      <View className="gap-1.5">
        <Text className="text-center text-xl font-bold text-foreground">
          {t('bookings.staffNoAccessTitle')}
        </Text>
        <Text className="max-w-[300px] text-center text-sm leading-relaxed text-muted-foreground">
          {t('bookings.staffNoAccessMessage')}
        </Text>
      </View>
    </View>
  );
}
