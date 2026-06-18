import { BottomNav } from '@/components/common/bottom-nav';
import { Leadership } from '@/components/common/leadership';
import { useStaffAuth } from '@/components/providers/staff-auth-provider';
import { HomeBanner } from '@/features/home-banner';
import { useStaffLeadershipQuery } from '@/features/leadership/hooks/use-staff-leadership-query';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
// import { StaffHomeDashboard } from '@/features/tickets/components/staff-home-dashboard';
import { StaffHomeAnalytics } from '@/features/tickets/components/staff-home-analytics';

export default function StaffHomeScreen() {
  const { t } = useTranslation();
  const { staffInfo } = useStaffAuth();
  const {
    data: leadership,
    isLoading: isLeadershipLoading,
    isError: isLeadershipError,
    error: leadershipError,
    refetch: refetchLeadership,
  } = useStaffLeadershipQuery();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-background flex-1 pb-28">
        <ScrollView showsVerticalScrollIndicator={false}>
          <HomeBanner userName={staffInfo?.name ?? t('common.staff')} />

          <Leadership
            isLoading={isLeadershipLoading}
            isError={isLeadershipError}
            error={leadershipError ?? undefined}
            leadership={leadership ?? []}
            onRetry={() => void refetchLeadership()}
          />

          <StaffHomeAnalytics />
          {/* <StaffHomeDashboard /> */}
        </ScrollView>

        <BottomNav activeItemId="home" />
      </View>
    </>
  );
}
