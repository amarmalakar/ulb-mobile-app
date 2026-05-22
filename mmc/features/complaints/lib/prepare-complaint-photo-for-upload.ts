import * as ImageManipulator from "expo-image-manipulator";

export type PreparedComplaintPhoto = {
  uri: string;
  mimeType: string;
  filename: string;
};

async function getFileSize(uri: string): Promise<number> {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob.size;
}

const UPLOAD_PREP_MAX_WIDTH = 1280;
const UPLOAD_PREP_TARGET_BYTES = 2_500_000;

/**
 * Convert local photos (incl. iPhone HEIC) to JPEG before upload.
 * Server compresses to the final storage size (100 KB WebP).
 */
export async function prepareComplaintPhotoForUpload(uri: string): Promise<PreparedComplaintPhoto> {
  let quality = 0.75;
  let width = UPLOAD_PREP_MAX_WIDTH;
  let lastUri = uri;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width } }],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      },
    );

    lastUri = result.uri;
    const size = await getFileSize(result.uri);

    if (size <= UPLOAD_PREP_TARGET_BYTES) {
      return {
        uri: result.uri,
        mimeType: "image/jpeg",
        filename: `photo-${Date.now()}.jpg`,
      };
    }

    quality = Math.max(0.45, quality - 0.1);
    width = Math.max(960, Math.round(width * 0.85));
  }

  return {
    uri: lastUri,
    mimeType: "image/jpeg",
    filename: `photo-${Date.now()}.jpg`,
  };
}
