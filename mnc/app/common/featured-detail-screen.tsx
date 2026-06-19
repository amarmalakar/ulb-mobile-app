import { Stack, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TopNavigation } from "@/components/common/top-navigation";
import { Typography } from "@/components/common/typography";
import { FeaturedDetailView } from "@/features/home-featured/components/featured-detail-view";
import { getFeaturedItemById } from "@/features/home-featured/lib/get-featured-item";
import { featuredIdFromParams } from "@/features/home-featured/lib/route-params";

export default function FeaturedDetailScreen() {
  const params = useLocalSearchParams<{ featuredId?: string | string[] }>();
  const featuredId = featuredIdFromParams(params);
  const item = getFeaturedItemById(featuredId);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
        <TopNavigation label={item?.title ?? "Featured"} isBackButton />

        {item ? (
          <FeaturedDetailView item={item} />
        ) : (
          <View className="flex-1 items-center justify-center px-6">
            <Typography className="text-center text-muted-foreground">
              Featured item not found.
            </Typography>
          </View>
        )}
      </SafeAreaView>
    </>
  );
}
