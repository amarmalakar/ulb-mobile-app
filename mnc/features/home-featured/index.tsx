import { Pressable, ScrollView, useWindowDimensions, View, ActivityIndicator } from "react-native";
import { useEffect, useRef, useState } from "react";
import { MenuIcon } from "lucide-react-native";
import { UserAvatar } from "@/components/common/user-avatar";
import { MobileMenu } from "@/components/common/mobile-menu";
import { Typography } from "@/components/common/typography";
import { useLogout } from "@/hooks/use-logout";
import { FeaturedGradient } from "./components/featured-gradient";
import { FeaturedMedia } from "./components/featured-media";
import type { FeaturedItem } from "./types";

export function HomeFeatured({
  userName,
  items,
  isLoading = false,
  isError = false,
  error,
  onRetry,
}: {
  userName: string;
  items: FeaturedItem[];
  isLoading?: boolean;
  isError?: boolean;
  error?: Error;
  onRetry?: () => void;
}) {
  const sliderRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const { logout, isLoggingOut } = useLogout();

  useEffect(() => {
    setActiveSlideIndex(0);
    sliderRef.current?.scrollTo({ x: 0, animated: false });
  }, [items.length]);

  useEffect(() => {
    if (items.length <= 1) {
      return;
    }

    const intervalId = setInterval(() => {
      setActiveSlideIndex((currentIndex) => {
        const nextIndex = (currentIndex + 1) % items.length;
        sliderRef.current?.scrollTo({ x: width * nextIndex, animated: true });
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(intervalId);
  }, [width, items.length]);

  if (isLoading) {
    return (
      <View className="h-[424px] w-full items-center justify-center bg-muted">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="h-[424px] w-full items-center justify-center gap-3 bg-muted px-6">
        <Typography className="text-center text-muted-foreground">
          {error?.message ?? "Failed to load featured items"}
        </Typography>
        {onRetry ? (
          <Pressable onPress={onRetry} className="rounded-md bg-primary px-4 py-2">
            <Typography className="text-primary-foreground">Retry</Typography>
          </Pressable>
        ) : null}
      </View>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <View>
        <ScrollView
          ref={sliderRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const nextIndex = Math.round(
              event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width
            );
            setActiveSlideIndex(nextIndex);
          }}>
          {items.map((slide, index) => (
            <View key={slide.id} className="h-[424px] w-screen">
              <FeaturedMedia
                type={slide.type}
                image={slide.image}
                video={slide.video}
                title={slide.title}
                description={slide.description}
                logo={slide.logo}
                isActive={index === activeSlideIndex}
                link={slide.link}
                linkText={slide.linkText}
              />

              {slide.type !== "TEXT" ? (
                <FeaturedGradient
                  featuredId={slide.id}
                  logo={slide.logo}
                  title={slide.title}
                  subTitle={slide.subtitle ?? ''}
                  link={slide.link}
                  linkText={slide.linkText}
                />
              ) : null}
            </View>
          ))}
        </ScrollView>

        <View className="absolute left-0 right-0 top-0 px-5 pt-12">
          <View className="flex-row items-center justify-between">
            <UserAvatar userName={userName} />

            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={() => setIsMenuVisible(true)}
                disabled={isLoggingOut}
                className="h-9 w-9 items-center justify-center rounded-full bg-black/35 shadow-lg">
                <MenuIcon size={18} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        </View>

        {items.length > 1 ? (
          <View className="absolute bottom-3 left-0 right-0 flex-row items-center justify-center gap-2 shadow-lg">
            {items.map((slide, index) => (
              <View
                key={slide.id}
                className={index === activeSlideIndex ? 'h-2.5 w-6 rounded-full bg-white' : 'h-2.5 w-2.5 rounded-full bg-white/45'}
              />
            ))}
          </View>
        ) : null}
      </View>

      {isMenuVisible ? (
        <MobileMenu
          visible={isMenuVisible}
          userName={userName}
          onClose={() => setIsMenuVisible(false)}
          onLogout={() => {
            setIsMenuVisible(false);
            void logout();
          }}
        />
      ) : null}
    </>
  );
}
