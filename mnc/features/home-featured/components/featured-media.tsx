import { useEffect } from "react";
import { Image, Linking, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { useVideoPlayer, VideoView } from "expo-video";
import { type FeaturedItemType } from "../types";
import { Typography } from "@/components/common/typography";
import { Button } from "@/components/ui/button";

export function FeaturedMedia({
  type,
  image,
  title,
  description,
  logo,
  link,
  linkText,
  isActive = true,
  showVideoControls = false,
}: {
  type: FeaturedItemType;
  image: string;
  title: string;
  description: string;
  logo?: string;
  isActive?: boolean;
  link?: string;
  linkText?: string;
  showVideoControls?: boolean;
}) {
  const player = useVideoPlayer(type === "VIDEO" ? image : null, (player) => {
    if (showVideoControls) {
      player.loop = false;
      player.muted = false;
      player.volume = 1;
      return;
    }

    player.loop = true;
    player.muted = true;
  });

  useEffect(() => {
    if (type !== "VIDEO") {
      return;
    }

    if (showVideoControls) {
      player.muted = false;
      player.volume = 1;
      player.play();
      return;
    }

    player.muted = true;

    if (isActive) {
      player.play();
      return;
    }

    player.pause();
  }, [type, isActive, player, showVideoControls]);

  if (type === "IMAGE") {
    return (
      <Image
        source={{ uri: image }}
        resizeMode="cover"
        className="h-full w-full"
      />
    );
  }

  if (type === "VIDEO") {
    return (
      <View className="h-full w-full">
        <VideoView
          player={player}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          nativeControls={showVideoControls}
          allowsPictureInPicture={showVideoControls}
        />
      </View>
    );
  }

  if (type === "TEXT") {
    return (
      <View className="h-full w-full">
        <View className="absolute w-full h-full inset-0 bg-primary" />

        <View className="h-full w-full items-center justify-center px-8">
          {logo ? (
            <Animated.View entering={FadeIn.duration(500)} className="mb-6">
              <Image source={{ uri: logo }} className="size-16 rounded-full" />
            </Animated.View>
          ) : null}

          <Animated.View entering={FadeInUp.duration(600).springify()}>
            <Typography variant="h3" className="text-center text-white">
              {title}
            </Typography>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(250).duration(600).springify()}
            className="mt-4"
          >
            <Typography variant="body1" className="text-center text-white/80">
              {description}
            </Typography>
          </Animated.View>

          {link ? (
            <Animated.View
              entering={FadeInUp.delay(500).duration(600).springify()}
              className="mt-6 w-full self-stretch"
            >
              <Button
                variant="default" className="w-full bg-white"
                onPress={() => {
                  if (link) {
                    Linking.openURL(link);
                  }
                }}
              >
                <Typography variant="body1" className="text-primary">
                  {linkText}
                </Typography>
              </Button>
            </Animated.View>
          ) : null}
        </View>
      </View>
    );
  }

  return null;
}