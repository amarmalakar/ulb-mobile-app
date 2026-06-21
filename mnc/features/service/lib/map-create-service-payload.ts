import type { CreateUserServiceTicketRequest } from "@/features/service/types";
import { TicketCategory } from "@/features/tickets/types";

import type { ServiceFormValues } from "@/features/service/hooks/use-service-form";
import { isComplaintPhotoStorageKey } from "@/features/service/lib/complaint-photo-storage-key";

function isLocalPhotoUri(uri: string): boolean {
  const t = uri.trim();
  return t.length > 0 && !/^https?:\/\//i.test(t) && !isComplaintPhotoStorageKey(t);
}

function storedImageRefs(images: string[]): string[] {
  return images
    .map((uri) => uri.trim())
    .filter((uri) => uri.length > 0 && !isLocalPhotoUri(uri));
}

export function mapServiceFormToCreateRequest(
  data: ServiceFormValues,
): CreateUserServiceTicketRequest {
  const locationAddress = data.locationAddress?.trim();
  const imageKeys = storedImageRefs(data.images);

  return {
    serviceId: data.serviceId,
    subServiceId: data.subServiceId,
    ticketCategory: data.ticketCategory ?? TicketCategory.SERVICE,
    wardNumber: data.ward,
    phoneNumber: data.phoneNumber,
    description: data.description,
    ...(locationAddress ? { locationAddress } : {}),
    ...(data.latitude !== undefined ? { latitude: data.latitude } : {}),
    ...(data.longitude !== undefined ? { longitude: data.longitude } : {}),
    ...(imageKeys.length > 0 ? { imageKeys } : {}),
  };
}
