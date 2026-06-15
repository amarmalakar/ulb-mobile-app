import { View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { TopNavigation } from "@/components/common/top-navigation";
import { getLocaleString } from "@/lib/i18n/get-locale-string";
import { ServiceForm } from "@/features/service/components/service-form";


export default function ServiceFormScreen() {
  const router = useRouter();
  const { params } = useLocalSearchParams<{ params?: string | string[] }>();
  const parsedParams = JSON.parse(params as string);
  const { serviceId, serviceTitle, subServicesArray } = parsedParams;

  const title = getLocaleString(serviceTitle);
  const subServices = subServicesArray.map((subService: any) => ({
    value: subService.id,
    label: getLocaleString(subService.title),
  }));

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-background flex-1">
        <TopNavigation label={title} />

        <ServiceForm
          serviceId={serviceId}
          subServices={subServices}
          onCancel={() => router.back()}
        />
      </View>
    </>
  );
}