import { Pressable, View } from "react-native";
import { Control, FieldValues, Path, PathValue, UseFormReturn, useWatch } from "react-hook-form";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { File } from "expo-file-system";
import { COMPLAINT_PHOTO_RAW_MAX_BYTES } from "@/features/complaints/constants";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/text";
import { Image } from "expo-image";
import { XIcon } from "lucide-react-native";

const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = COMPLAINT_PHOTO_RAW_MAX_BYTES;
const MAX_PHOTO_MB = MAX_PHOTO_BYTES / (1024 * 1024);

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
}: {
  control: Control<TFieldValues>;
  name: TName;
  formState: UseFormReturn<TFieldValues>;
}) {
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
      setPickerError("Photo library access is required to attach images.");
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
      if (byteSize !== null && byteSize > MAX_PHOTO_BYTES) {
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
            ? `Photo is ${largestRejectedMb} MB. Max ${MAX_PHOTO_MB} MB per photo.`
            : `Each photo must be ${MAX_PHOTO_MB} MB or smaller.`
          : "No photos could be added.",
      );
      return;
    }

    setValue(name, [...photos, ...accepted] as PathValue<TFieldValues, TName>, {
      shouldValidate: true,
    });

    if (skippedOversized) {
      setPickerError(
        largestRejectedMb !== null
          ? `Some photos were skipped (over ${MAX_PHOTO_MB} MB; largest was ${largestRejectedMb} MB).`
          : `Some photos were skipped because they exceed ${MAX_PHOTO_MB} MB.`,
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
          "border-border items-center justify-center rounded-lg border border-dashed py-4",
          photos.length >= MAX_PHOTOS && "opacity-50",
        )}
      >
        <Text className="text-foreground font-medium">Add photos</Text>
      </Pressable>
      <Text className="text-muted-foreground text-center text-xs">
        {photos.length}/{MAX_PHOTOS} photo(s) added, max {MAX_PHOTO_MB} MB each
      </Text>

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
      {pickerError ? <Text className="text-destructive text-sm">{pickerError}</Text> : null}
      {errors[name] ? (
        <Text className="text-destructive text-sm">{String(errors[name]?.message)}</Text>
      ) : null}
    </View>
  );
}
