import { Pressable, View } from "react-native";
import { Control, FieldValues, Path, PathValue, UseFormReturn, useWatch } from "react-hook-form";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";
import { File } from "expo-file-system";
import { cn } from "@/lib/utils";
import { Typography } from "@/components/common/typography";
import { Image } from "expo-image";
import { XIcon } from "lucide-react-native";

const MAX_PHOTOS = 3;

function formatMegabytes(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1);
}

/**
 * `asset.fileSize` from expo-image-picker is unreliable on iOS (HEIC→JPEG export
 * can report inflated sizes). Read the copied file on disk when possible.
 */
function byteSizeForPickedAsset(asset: ImagePicker.ImagePickerAsset): number | null {
  if (asset.uri) {
    try {
      const file = new File(asset.uri);
      if (file.exists && file.size > 0) {
        return file.size;
      }
    } catch {
      // fall through to asset.fileSize
    }
  }
  if (typeof asset.fileSize === "number" && asset.fileSize > 0) {
    return asset.fileSize;
  }
  return null;
}

export function PhotoPicker<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>,
>({
  control,
  name,
  formState,
  maxPhotoBytes,
}: {
  control: Control<TFieldValues>;
  name: TName;
  formState: UseFormReturn<TFieldValues>;
  maxPhotoBytes: number;
}) {
  const { t } = useTranslation();
  const maxPhotoMb = maxPhotoBytes / (1024 * 1024);
  const {
    formState: { errors },
    setValue,
  } = formState;
  const watched = useWatch({ control, name });
  const photos = (Array.isArray(watched) ? watched : []) as string[];
  const [pickerError, setPickerError] = useState<string | null>(null);

  const pickPhoto = async () => {
    setPickerError(null);
    const remainingSlots = MAX_PHOTOS - photos.length;
    if (remainingSlots <= 0) return;

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setPickerError(t("service.photoLibraryRequired"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: remainingSlots,
      preferredAssetRepresentationMode:
        ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
    });

    if (result.canceled || !result.assets?.length) return;

    const accepted: string[] = [];
    let skippedOversized = false;
    let largestRejectedMb: number | null = null;

    for (const asset of result.assets) {
      if (photos.length + accepted.length >= MAX_PHOTOS) break;

      const byteSize = byteSizeForPickedAsset(asset);
      if (byteSize !== null && byteSize > maxPhotoBytes) {
        skippedOversized = true;
        const mb = Number.parseFloat(formatMegabytes(byteSize));
        if (largestRejectedMb === null || mb > largestRejectedMb) {
          largestRejectedMb = mb;
        }
        continue;
      }
      accepted.push(asset.uri);
    }

    if (accepted.length === 0) {
      setPickerError(
        skippedOversized
          ? largestRejectedMb !== null
            ? t("service.photoTooLarge", { size: largestRejectedMb, max: maxPhotoMb })
            : t("service.photoMaxSize", { max: maxPhotoMb })
          : t("service.noPhotosAdded"),
      );
      return;
    }

    setValue(name, [...photos, ...accepted] as PathValue<TFieldValues, TName>, {
      shouldValidate: true,
    });

    if (skippedOversized) {
      setPickerError(
        largestRejectedMb !== null
          ? t("service.photosSkipped", { max: maxPhotoMb, largest: largestRejectedMb })
          : t("service.photosSkippedShort", { max: maxPhotoMb }),
      );
    }
  };

  const removePhotoAt = (index: number) => {
    setPickerError(null);
    const next = photos.filter((_, i) => i !== index);
    setValue(name, next as PathValue<TFieldValues, TName>, { shouldValidate: true });
  };

  return (
    <View className="gap-2">
      <Pressable
        onPress={() => void pickPhoto()}
        disabled={photos.length >= MAX_PHOTOS}
        className={cn(
          "items-center justify-center rounded-lg border border-dashed border-primary py-4",
          photos.length >= MAX_PHOTOS && "opacity-50",
        )}
      >
        <Typography className="text-primary font-medium">{t("service.addPhotos")}</Typography>
      </Pressable>
      <Typography className="text-muted-foreground text-center text-xs">
        {t("service.photosHint", {
          count: photos.length,
          max: MAX_PHOTOS,
          maxMb: maxPhotoMb,
        })}
      </Typography>

      {photos.length > 0 ? (
        <View className="flex-row flex-wrap gap-2">
          {photos.map((uri, index) => (
            <View key={`${uri}-${index}`} className="relative">
              <Image
                source={{ uri }}
                style={{ width: 80, height: 80, borderRadius: 8 }}
                contentFit="cover"
              />
              <Pressable
                onPress={() => removePhotoAt(index)}
                className="absolute -right-1 -top-1 size-6 items-center justify-center rounded-full bg-black/70"
                hitSlop={8}
              >
                <XIcon size={14} color="#fff" />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
      {pickerError ? <Typography className="text-destructive text-sm">{pickerError}</Typography> : null}
      {errors[name] ? (
        <Typography className="text-destructive text-sm">{String(errors[name]?.message)}</Typography>
      ) : null}
    </View>
  );
}
