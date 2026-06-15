import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { Image } from "expo-image";
import { MapPin } from "lucide-react-native";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import MapView, { Marker } from "react-native-maps";

import { Text } from "../../../components/ui/text";
import type { TicketInfoAuthType } from "../types";

import { ExpandableDescription } from "./ticket-component-helper";
import { TicketUserRating } from "./ticket-user-rating";
import { Typography } from "@/components/common/typography";

export default function TicketDescription({
  description,
  images,
  locationAddress,
  latitude,
  longitude,
  rating,
  canRate = false,
  ticketId,
  authType,
}: {
  description: string;
  images: string[];
  locationAddress?: string;
  latitude?: number | null;
  longitude?: number | null;
  rating?: number | null;
  canRate?: boolean;
  ticketId: string;
  authType: TicketInfoAuthType;
}) {
  const { t } = useTranslation();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const sliderRef = useRef<FlatList<string>>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const mapLatitude = latitude ?? 24.0449;
  const mapLongitude = longitude ?? 84.0697;

  const viewerHeight = Math.round(windowHeight * 0.75);

  const openViewer = (index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };

  const closeViewer = () => {
    setViewerOpen(false);
  };

  const onViewerScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / windowWidth);
    setViewerIndex(nextIndex);
  };

  return (
    <View className="gap-5">
      {authType === "User" ? (
        <TicketUserRating ticketId={ticketId} rating={rating} canRate={canRate} />
      ) : null}

      <ExpandableDescription description={description} />

      <View>
        <Text className="mb-3 text-sm font-semibold text-muted-foreground">{t("tickets.photos")}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-3">
            {images.length > 0 ? (
              images.map((item, index) => (
                <Pressable key={`${item}-${index}`} onPress={() => openViewer(index)}>
                  <Image
                    source={{ uri: item }}
                    style={{
                      width: 112,
                      height: 112,
                      borderRadius: 12,
                      backgroundColor: "#e5e7eb",
                    }}
                    contentFit="cover"
                  />
                </Pressable>
              ))
            ) : (
              <View className="h-28 w-full items-center justify-center rounded-xl border border-dashed border-muted-foreground/40 bg-muted/30 px-4">
                <Text className="text-sm text-muted-foreground">{t("tickets.noImages")}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      <View className="overflow-hidden rounded-xl border border-border bg-card">
        <View className="flex-row items-center gap-2 border-b border-border px-4 py-3">
          <MapPin size={18} color="#0EA5E9" />
          <Typography variant="caption">{t("tickets.location")}</Typography>
        </View>

        <View className="h-52 border-b border-border">
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: mapLatitude,
              longitude: mapLongitude,
              latitudeDelta: 0.08,
              longitudeDelta: 0.08,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
          >
            <Marker coordinate={{ latitude: mapLatitude, longitude: mapLongitude }} />
          </MapView>
        </View>

        <View className="px-4 py-3">
          <Text className="text-base leading-7 text-foreground">
            {locationAddress?.trim() || t("tickets.noAddress")}
          </Text>
        </View>
      </View>

      <Modal
        visible={viewerOpen && images.length > 0}
        transparent
        animationType="fade"
        onRequestClose={closeViewer}
        onShow={() => {
          if (images.length === 0) return;
          requestAnimationFrame(() => {
            sliderRef.current?.scrollToIndex({
              index: viewerIndex,
              animated: false,
            });
          });
        }}
      >
        <View className="flex-1 bg-black/90">
          <View className="absolute right-5 top-12 z-10 flex-row items-center gap-3">
            {images.length > 1 ? (
              <Text className="text-sm font-medium text-white/80">
                {viewerIndex + 1} / {images.length}
              </Text>
            ) : null}
            <Pressable
              className="rounded-full bg-white/20 px-3 py-1"
              onPress={closeViewer}
            >
              <Text className="text-base font-semibold text-white">{t("common.close")}</Text>
            </Pressable>
          </View>

          <FlatList
            ref={sliderRef}
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            getItemLayout={(_, index) => ({
              length: windowWidth,
              offset: windowWidth * index,
              index,
            })}
            onScrollToIndexFailed={({ index }) => {
              sliderRef.current?.scrollToOffset({
                offset: windowWidth * index,
                animated: false,
              });
            }}
            onMomentumScrollEnd={onViewerScrollEnd}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({ item }) => (
              <View
                style={{
                  width: windowWidth,
                  height: windowHeight,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: 16,
                }}
              >
                <Image
                  source={{ uri: item }}
                  style={{ width: windowWidth - 32, height: viewerHeight, borderRadius: 16 }}
                  contentFit="contain"
                />
              </View>
            )}
          />

          {images.length > 1 ? (
            <View className="absolute bottom-10 left-0 right-0 flex-row items-center justify-center gap-2">
              {images.map((uri, index) => (
                <View
                  key={`${uri}-dot-${index}`}
                  className={
                    index === viewerIndex
                      ? "h-2.5 w-6 rounded-full bg-white"
                      : "h-2.5 w-2.5 rounded-full bg-white/45"
                  }
                />
              ))}
            </View>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}
