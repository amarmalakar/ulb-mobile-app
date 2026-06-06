import { View } from "react-native";
import MapView from "react-native-maps";
import { Typography } from "@/components/ui/typography";

export function TestMap() {
  return (
    <View className="p-4 gap-4">
      <Typography variant="h4" className="text-primary">Test Map</Typography>
      <View className="border-border overflow-hidden rounded-xl border bg-card">
        <View className="h-52 w-full">
          <MapView
            style={{ height: 208, width: "100%" }}
            initialRegion={{
              latitude: 24.0449,
              longitude: 84.0697,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          />
        </View>
      </View>
    </View>
  )
}