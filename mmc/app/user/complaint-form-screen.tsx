import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { TopNavigation } from "@/components/common/top-navigation";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ComplaintForm } from "@/features/complaints/components/complaint-form";

type ComplaintFormRouteParams = {
  complaintId: string;
  complaintTitle: string;
  subComplaints: string[];
};

export default function ComplaintFormScreen() {
  const router = useRouter();
  const { params } = useLocalSearchParams<{ params?: string | string[] }>();
  const { complaintId, complaintTitle, subComplaints: subComplaintsArray } = JSON.parse(params as string);

  const subComplaints = (subComplaintsArray || []).map((subComplaint: any) => subComplaint.title);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-background flex-1">
        <TopNavigation label={complaintTitle} />

        <ComplaintForm
          complaintId={complaintId}
          subComplaints={subComplaints}
          onCancel={() => router.back()}
        />
      </View>
    </>
  );
}