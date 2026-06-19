import { StyleSheet, View, Image, Linking, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Typography } from "@/components/common/typography";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FeaturedGradient({
  featuredId,
  title,
  subTitle,
  logo,
  link,
  linkText,
}: {
  featuredId: string;
  title: string;
  subTitle: string;
  logo?: string;
  link?: string;
  linkText?: string;
}) {
  const router = useRouter();

  const openDetails = () => {
    router.push({
      pathname: "/common/featured-detail-screen",
      params: { featuredId },
    });
  };

  return (
    <View className="absolute bottom-0 left-0 right-0 h-40 ">
      <LinearGradient
        colors={[
          "rgba(0, 0, 0, 0)",
          "rgba(0, 0, 0, 0.63)",
          "rgba(0, 0, 0, 1)",
        ]}
        locations={[0, 0.55, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      <View className={cn(
        "absolute bottom-0 left-0 right-0 h-32 p-4",
        "flex-row items-center justify-between gap-2"
      )}
      >
        <Pressable
          onPress={openDetails}
          className="flex-1 flex-row items-center gap-4"
        >
          {logo ? (
            <Image source={{ uri: logo }} className="size-10 rounded-full" />
          ) : null}

          <View className="flex-1">
            <Typography variant="h5" className="text-white">{title}</Typography>
            <Typography variant="caption" className="text-white" numberOfLines={2}>{subTitle}</Typography>
          </View>
        </Pressable>

        {link ? (
          <Button size="sm" onPress={() => {
            if (link) {
              Linking.openURL(link);
            }
          }}>
            <Typography variant="caption" className="text-white">{linkText}</Typography>
          </Button>
        ) : null}
      </View>
    </View>
  );
}