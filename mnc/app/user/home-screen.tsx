import { BottomNav } from '@/components/common/bottom-nav';
import { Leadership } from '@/components/common/leadership';
import { useUserAuth } from '@/components/providers/user-auth-provider';
import { HomeBanner } from '@/features/home-banner';
import { useUserLeadershipQuery } from '@/features/leadership/hooks/use-user-leadership-query';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

export default function UserHomeScreen() {
  const { t } = useTranslation();
  const { userInfo } = useUserAuth();
  const {
    data: leadership,
    isLoading: isLeadershipLoading,
    isError: isLeadershipError,
    error: leadershipError,
    refetch: refetchLeadership,
  } = useUserLeadershipQuery();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-background flex-1 pb-28">
        <ScrollView showsVerticalScrollIndicator={false}>
          <HomeBanner userName={userInfo?.name ?? t('common.user')} />

          <Leadership
            isLoading={isLeadershipLoading}
            isError={isLeadershipError}
            error={leadershipError ?? undefined}
            leadership={leadership ?? []}
            onRetry={() => void refetchLeadership()}
          />
        </ScrollView>

        <BottomNav activeItemId="home" />
      </View>
    </>
  );
}
