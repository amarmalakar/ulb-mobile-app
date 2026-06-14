import { Typography } from '@/components/common/typography';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

export function AppLoadingScreen() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-background px-6">
      <ActivityIndicator size="large" className="text-primary" />
      <Typography variant="body1" color="muted" align="center">
        {t('appInit.loading')}
      </Typography>
    </View>
  );
}
