import { Pressable, View } from "react-native";
import { Typography } from "@/components/common/typography";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";

export function StaffHomeDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <View className="p-4">
      <Typography variant="h5" className="text-primary">
        {t("bookings.staffTotalBookingsTitle", { total: 10 })}
        {/* {t("bookings.staffTotalBookingsTitle", { total: bookingSummary.total })} */}
      </Typography>

      <Pressable
        // key={item.id}
        className="mb-3 w-1/3 px-1"
        onPress={() => {
          router.push({
            pathname: '/staff/staff-bookings-screen',
            params: { bookingResourceId: 'cmqdg5c7i00040lls3cxt8a0s' }
          });
        }}
      >
        <View className="rounded-2xl border border-border bg-card p-3 shadow-sm">
          <Typography>Town Hall</Typography>
        </View>
      </Pressable>


    </View>
  );
}