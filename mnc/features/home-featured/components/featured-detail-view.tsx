import { Linking, ScrollView, View, Image } from "react-native";
import { Typography } from "@/components/common/typography";
import { Button } from "@/components/ui/button";
import { type FeaturedItem } from "../types";
import { FeaturedMedia } from "./featured-media";

export function FeaturedDetailView({ item }: { item: FeaturedItem }) {
  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerClassName="pb-8"
    >
      <View className="h-[360px] w-full">
        <FeaturedMedia
          type={item.type}
          image={item.image}
          video={item.video}
          title={item.title}
          description={item.description}
          logo={item.logo}
          link={item.link}
          linkText={item.linkText}
          isActive
          showVideoControls={item.type === "VIDEO"}
        />
      </View>

      <View className="gap-4 p-4">
        <View className="flex-row items-center gap-3">
          {item.logo ? (
            <Image source={{ uri: item.logo }} className="size-12 rounded-full" />
          ) : null}

          <Typography variant="h3" className="flex-1 text-foreground">
            {item.title}
          </Typography>
        </View>

        <Typography variant="body1" className="leading-6 text-foreground">
          {item.description}
        </Typography>

        {item.link ? (
          <Button
            className="mt-2"
            onPress={() => {
              void Linking.openURL(item.link!);
            }}
          >
            <Typography variant="body1" className="text-primary-foreground">
              {item.linkText ?? "Learn more"}
            </Typography>
          </Button>
        ) : null}
      </View>
    </ScrollView>
  );
}
