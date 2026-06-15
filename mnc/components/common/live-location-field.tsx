import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";

import { Icon } from "../ui/icon";
import { Separator } from "../ui/separator";
import { Text } from "../ui/text";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";

import { MapPinIcon } from "lucide-react-native";
import { Control, Controller, FieldValues, Path, PathValue, useWatch, UseFormReturn } from "react-hook-form";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

export function LiveLocationField<
  TFieldValues extends FieldValues,
  TSource extends Path<TFieldValues>,
  TAddress extends Path<TFieldValues>,
  TLat extends Path<TFieldValues>,
  TLon extends Path<TFieldValues>,
>({
  control,
  locationSourceName,
  locationAddressName,
  latitudeName,
  longitudeName,
  formState,
}: {
  control: Control<TFieldValues>;
  locationSourceName: TSource;
  locationAddressName: TAddress;
  latitudeName: TLat;
  longitudeName: TLon;
  formState: UseFormReturn<TFieldValues>;
}) {
  const { t } = useTranslation();
  const { formState: { errors }, setValue } = formState;
  const locationSource = useWatch({ control, name: locationSourceName });
  const [mapCoords, setMapCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [pickerError, setPickerError] = useState<string | null>(null);

  const resolveCurrentLocation = useCallback(async () => {
    setLocationLoading(true);
    setPickerError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setPickerError(t("complaints.locationPermissionRequired"));
        setLocationLoading(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      const { latitude, longitude } = pos.coords;
      setMapCoords({ latitude, longitude });
      setValue(latitudeName, latitude as PathValue<TFieldValues, TLat>, { shouldValidate: true });
      setValue(longitudeName, longitude as PathValue<TFieldValues, TLon>, { shouldValidate: true });
      const places = await Location.reverseGeocodeAsync({ latitude, longitude });
      const p = places[0];
      const line = [
        [p.streetNumber, p.street].filter(Boolean).join(" "),
        p.name,
        p.district,
        p.city,
        p.region,
        p.postalCode,
        p.country
      ].filter(Boolean).join(", ");
      setValue(
        locationAddressName,
        (line || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`) as PathValue<TFieldValues, TAddress>,
        { shouldValidate: true },
      );
    } catch {
      setPickerError(t("complaints.locationResolveFailed"));
    } finally {
      setLocationLoading(false);
    }
  }, [setValue, latitudeName, longitudeName, locationAddressName]);

  useEffect(() => {
    if (locationSource === "current") {
      void resolveCurrentLocation();
    } else {
      setValue(locationAddressName, undefined as PathValue<TFieldValues, TAddress>, { shouldValidate: true });
      setValue(latitudeName, undefined as PathValue<TFieldValues, TLat>, { shouldValidate: true });
      setValue(longitudeName, undefined as PathValue<TFieldValues, TLon>, { shouldValidate: true });
      setMapCoords(null);
    }
  }, [
    locationSource,
    setValue,
    resolveCurrentLocation,
    locationAddressName,
    latitudeName,
    longitudeName,
  ]);

  const mapRegion = useMemo(
    () =>
      mapCoords
        ? {
          latitude: mapCoords.latitude,
          longitude: mapCoords.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015
        }
        : {
          latitude: 23.685,
          longitude: 85.508,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05
        },
    [mapCoords]
  );

  return (
    <View className="border-border overflow-hidden rounded-xl border bg-card">
      <View className="flex-row items-center gap-2 px-4 pb-3 pt-4">
        <Icon as={MapPinIcon} className="size-[18px] text-primary" />
        <Text className="text-muted-foreground text-sm font-medium">
          {t("complaints.selectProblemLocation")}
        </Text>
      </View>

      <Separator />

      <Controller
        control={control}
        name={locationSourceName}
        render={({ field: { onChange, value } }) => (
          <View className="px-4 py-3">
            <RadioGroup value={value} onValueChange={(v) => onChange(v)}>
              <View className="flex-row flex-wrap gap-x-8 gap-y-2">
                <View className="flex-row items-center gap-2">
                  <RadioGroupItem value="current" aria-labelledby="loc-current" />
                  <Label
                    className="font-normal"
                    nativeID="loc-current"
                    onPress={() => onChange("current")}
                  >
                    {t("complaints.currentLocation")}
                  </Label>
                </View>
                <View className="flex-row items-center gap-2">
                  <RadioGroupItem value="profile" aria-labelledby="loc-profile" />
                  <Label
                    className="font-normal"
                    nativeID="loc-profile"
                    onPress={() => onChange("profile")}
                  >
                    {t("complaints.profileAddress")}
                  </Label>
                </View>
              </View>
            </RadioGroup>
          </View>
        )}
      />

      <Separator />

      <View className="overflow-hidden bg-muted">
        {locationLoading ? (
          <View className="h-44 items-center justify-center">
            <ActivityIndicator />
            <Text className="text-muted-foreground mt-2 text-sm">{t("complaints.findingLocation")}</Text>
          </View>
        ) : (
          <MapView
            style={{ height: 176, width: "100%" }}
            region={mapRegion}
            showsUserLocation={locationSource === "current"}
          >
            {mapCoords ? <Marker coordinate={mapCoords} /> : null}
          </MapView>
        )}
      </View>

      <Separator />

      <View className="gap-2 px-4 pb-4 pt-3">
        <Controller
          control={control}
          name={locationAddressName}
          render={({ field: { value } }) => (
            <View className="gap-1">
              <Text className="text-foreground text-sm leading-relaxed">{value}</Text>
              {errors[locationAddressName] ? (
                <Text className="text-destructive text-sm">{String(errors[locationAddressName].message)}</Text>
              ) : null}
            </View>
          )}
        />
        {pickerError ? <Text className="text-destructive text-sm">{pickerError}</Text> : null}
      </View>
    </View>
  )
}