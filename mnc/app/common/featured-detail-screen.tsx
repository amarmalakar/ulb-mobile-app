import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TopNavigation } from "@/components/common/top-navigation";
import { Typography } from "@/components/common/typography";
import { FeaturedDetailView } from "@/features/home-featured/components/featured-detail-view";
import { useFeaturedDetailQuery } from "@/features/home-featured/hooks/use-featured-detail-query";
import { featuredIdFromParams } from "@/features/home-featured/lib/route-params";

export default function FeaturedDetailScreen() {
  const params = useLocalSearchParams<{ featuredId?: string | string[] }>();
  const featuredId = featuredIdFromParams(params);
  const {
    data: item,
    isLoading,
    isError,
    error,
    refetch,
  } = useFeaturedDetailQuery({ featuredId });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
        <TopNavigation label={item?.title ?? "Featured"} isBackButton />

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" />
          </View>
        ) : isError ? (
          <View className="flex-1 items-center justify-center gap-3 px-6">
            <Typography className="text-center text-muted-foreground">
              {error?.message ?? "Failed to load featured item"}
            </Typography>
            <Typography
              className="text-primary"
              onPress={() => void refetch()}
            >
              Retry
            </Typography>
          </View>
        ) : item ? (
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
