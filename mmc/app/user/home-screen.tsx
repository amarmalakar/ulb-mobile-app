import { useUserAuth } from '@/components/provider/user-auth-provider';
import { Stack } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { HomeBanner } from '@/features/home-banner';
import { BottomNav } from '@/components/common/bottom-nav';
import { ComplaintList } from '@/features/complaints/components/complaint-list';
import { useTranslation } from 'react-i18next';
import { Leadership } from '@/components/common/leadership';
import { useUserLeadershipQuery } from '@/features/leadership/hooks/use-user-leadership-query';

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

          <ComplaintList />
        </ScrollView>

        <BottomNav activeItemId="home" />
      </View>
    </>
  );
}
