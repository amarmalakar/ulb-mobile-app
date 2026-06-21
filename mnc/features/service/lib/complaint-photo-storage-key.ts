import { SERVICE_PHOTOS_R2_PREFIX } from "@/features/service/constants";

/** True when `uri` is an R2 storage key (new or legacy layout), not a local file or http URL. */
export function isComplaintPhotoStorageKey(uri: string): boolean {
  const trimmed = uri.trim();
  if (!trimmed || /^https?:\/\//i.test(trimmed)) {
    return false;
  }
  if (trimmed.startsWith(`${SERVICE_PHOTOS_R2_PREFIX}/`)) {
    return true;
  }
  return /^[^/]+\/complaint-photos\//.test(trimmed);
}
