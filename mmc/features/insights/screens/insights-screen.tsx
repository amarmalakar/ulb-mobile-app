import { Stack } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { BottomNav } from '@/components/common/bottom-nav';
import { TopNavigation } from '@/components/common/top-navigation';
import { InsightList } from '@/features/insights/components/insight-list';
import { useInsightsQuery } from '@/features/insights/hooks/use-insights-query';
import { SafeAreaView } from 'react-native-safe-area-context';

export function InsightsScreen() {
  const { t } = useTranslation();
  const insightsQuery = useInsightsQuery();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
        <TopNavigation label={t('nav.insights')} isBackButton={false} />
        <InsightList query={insightsQuery} />
        <BottomNav activeItemId="insights" />
      </SafeAreaView>
    </>
  );
}
