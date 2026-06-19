import { Pressable, Image, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { MenuIcon } from "lucide-react-native";
import { UserAvatar } from "@/components/common/user-avatar";
import { MobileMenu } from "@/components/common/mobile-menu";
import { useLogout } from "@/hooks/use-logout";
import { HOME_FEATURED_ITEMS } from "./constants";
import { Typography } from "@/components/common/typography";
import { FeaturedGradient } from "./components/featured-gradient";
import { FeaturedMedia } from "./components/featured-media";

export function HomeFeatured({
  userName,
}: {
  userName: string;
}) {
  const sliderRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const { logout, isLoggingOut } = useLogout();

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveSlideIndex((currentIndex) => {
        const nextIndex = (currentIndex + 1) % HOME_FEATURED_ITEMS.length;
        sliderRef.current?.scrollTo({ x: width * nextIndex, animated: true });
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(intervalId);
  }, [width]);

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
          {HOME_FEATURED_ITEMS.map((slide, index) => (
            <View key={slide.id} className="h-[424px] w-screen">
              <FeaturedMedia
                type={slide.type}
                image={slide.image}
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
                  description={slide.description}
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

        <View className="absolute bottom-3 left-0 right-0 flex-row items-center justify-center gap-2 shadow-lg">
          {HOME_FEATURED_ITEMS.map((slide, index) => (
            <View
              key={slide.id}
              className={index === activeSlideIndex ? 'h-2.5 w-6 rounded-full bg-white' : 'h-2.5 w-2.5 rounded-full bg-white/45'}
            />
          ))}
        </View>
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