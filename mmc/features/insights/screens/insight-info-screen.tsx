import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { TopNavigation } from '@/components/common/top-navigation';
import { InsightDetailView } from '@/features/insights/components/insight-detail-view';
import { useInsightsQuery } from '@/features/insights/hooks/use-insights-query';
import { getInsightTitle } from '@/features/insights/lib/insight-utils';
import { firstParam } from '@/features/insights/lib/route-params';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '@/components/common/bottom-nav';

export function InsightInfoScreen() {
  const { t, i18n } = useTranslation();
  const { insightId } = useLocalSearchParams<{ insightId?: string | string[] }>();
  const id = firstParam(insightId);
  const insightsQuery = useInsightsQuery();
  const selected = insightsQuery.data?.find((item) => item.id === id);
  const navLabel = selected
    ? getInsightTitle(selected, i18n.resolvedLanguage)
    : t('insights.detailTitle');

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
        <TopNavigation label={navLabel} isBackButton />
        <InsightDetailView query={insightsQuery} insightId={id} />

        <BottomNav activeItemId="" />
      </SafeAreaView>
    </>
  );
}
