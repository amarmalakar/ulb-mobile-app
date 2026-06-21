import type { AxiosInstance } from "axios";

import { API_PATHS } from "@/lib/api-paths";
import { SERVICE_PHOTO_MAX_COUNT } from "@/features/service/constants";

import { prepareServicePhotoForUpload } from "./prepare-service-photo-for-upload";
import { isComplaintPhotoStorageKey } from "./complaint-photo-storage-key";

type OkResponse<T> = { ok: boolean; data?: T; message?: string };

type UploadData = {
  key: string;
  publicUrl?: string | null;
  size: number;
};

function isLocalPhotoUri(uri: string): boolean {
  const t = uri.trim();
  return t.length > 0 && !/^https?:\/\//i.test(t) && !isComplaintPhotoStorageKey(t);
}

function bearerHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` } as const;
}

async function uploadOnePhoto(
  client: AxiosInstance,
  accessToken: string,
  localUri: string,
): Promise<string> {
  const prepared = await prepareServicePhotoForUpload(localUri);
  const formData = new FormData();

  formData.append("file", {
    uri: prepared.uri,
    name: prepared.filename,
    type: prepared.mimeType,
  } as unknown as Blob);

  const res = (await client.post(API_PATHS.user.mediaUpload, formData, {
    headers: {
      ...bearerHeaders(accessToken),
      "Content-Type": "multipart/form-data",
    },
    timeout: 120_000,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  })) as OkResponse<UploadData>;

  if (!res.ok || !res.data?.key) {
    throw new Error(res.message ?? "Failed to upload photo");
  }
  return res.data.key;
}

/**
 * Upload local file URIs via API (sharp compress + R2). Returns storage keys for `imageKeys`.
 */
export async function uploadServicePhotos(
  client: AxiosInstance,
  accessToken: string,
  localUris: string[],
): Promise<string[]> {
  const locals = localUris.filter(isLocalPhotoUri).slice(0, SERVICE_PHOTO_MAX_COUNT);
  const existingKeys = localUris
    .map((u) => u.trim())
    .filter((u) => isComplaintPhotoStorageKey(u));

  if (locals.length === 0) {
    return existingKeys;
  }

  const results = await Promise.all(
    locals.map(async (uri) => {
      try {
        return { ok: true as const, key: await uploadOnePhoto(client, accessToken, uri) };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Photo upload failed";
        return { ok: false as const, message };
      }
    }),
  );

  const keys = results.filter((r): r is { ok: true; key: string } => r.ok).map((r) => r.key);
  const failed = results.filter((r): r is { ok: false; message: string } => !r.ok);

  if (failed.length > 0 && keys.length === 0) {
    throw new Error(failed[0]?.message ?? "Photo upload failed");
  }
  if (failed.length > 0) {
    throw new Error(
      `${failed.length} photo(s) failed to upload. ${keys.length} uploaded successfully.`,
    );
  }

  return [...existingKeys, ...keys].slice(0, SERVICE_PHOTO_MAX_COUNT);
}
