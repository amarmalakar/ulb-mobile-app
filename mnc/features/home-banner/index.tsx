import { Pressable, Image, ScrollView, useWindowDimensions, View } from "react-native";
import { useEffect, useRef, useState } from "react";
import { MenuIcon } from "lucide-react-native";
import { UserAvatar } from "@/components/common/user-avatar";
import { MobileMenu } from "@/components/common/mobile-menu";
import { useLogout } from "@/hooks/use-logout";

type UserHomeHeroProps = {
  userName: string;
};

const heroSlides = [
  'https://images.pexels.com/photos/28712146/pexels-photo-28712146.jpeg',
  'https://images.pexels.com/photos/36930062/pexels-photo-36930062.jpeg',
  'https://images.pexels.com/photos/30217970/pexels-photo-30217970.jpeg'
];

export function HomeBanner({ userName }: UserHomeHeroProps) {
  const sliderRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const { logout, isLoggingOut } = useLogout();

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveSlideIndex((currentIndex) => {
        const nextIndex = (currentIndex + 1) % heroSlides.length;
        sliderRef.current?.scrollTo({ x: width * nextIndex, animated: true });
        return nextIndex;
      });
    }, 3000);

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
          {heroSlides.map((slide) => (
            <Image
              key={slide}
              source={{ uri: slide }}
              resizeMode="cover"
              className="h-[424px] w-screen"
            />
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
          {heroSlides.map((slide, index) => (
            <View
              key={slide}
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