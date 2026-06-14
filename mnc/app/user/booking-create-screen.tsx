import { View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { TopNavigation } from '@/components/common/top-navigation';
import { UserBookingFlow } from '@/features/bookings/components/user-booking-flow';

export default function BookingCreateScreen() {
  const { t } = useTranslation();
  const { resourceId } = useLocalSearchParams<{
    resourceId: string;
  }>();

  // const sendEnquiry = useSendBookingEnquiryMutation(resourceId);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-background">
        <TopNavigation label={t('bookings.newBooking')} isBackButton />
        <UserBookingFlow resourceId={resourceId} />
      </View>
    </>
  );
}
