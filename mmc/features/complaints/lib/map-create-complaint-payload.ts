import type { CreateUserComplaintTicketRequest } from "@/features/complaints/types";
import { TicketCategory } from "@/features/tickets/types";

import type { ComplaintFormValues } from "@/features/complaints/hooks/use-complaint-form";

function isLocalPhotoUri(uri: string): boolean {
  const t = uri.trim();
  return t.length > 0 && !/^https?:\/\//i.test(t) && !t.startsWith("complaint-photos/");
}

function storedImageRefs(images: string[]): string[] {
  return images
    .map((uri) => uri.trim())
    .filter((uri) => uri.length > 0 && !isLocalPhotoUri(uri));
}

export function mapComplaintFormToCreateRequest(
  data: ComplaintFormValues,
): CreateUserComplaintTicketRequest {
  const locationAddress = data.locationAddress?.trim();
  const imageKeys = storedImageRefs(data.images);

  return {
    complaintId: data.complaintId,
    ticketCategory: data.ticketCategory ?? TicketCategory.COMPLIANT,
    wardNumber: data.ward,
    title: data.title,
    description: data.description,
    ...(locationAddress ? { locationAddress } : {}),
    ...(data.latitude !== undefined ? { latitude: data.latitude } : {}),
    ...(data.longitude !== undefined ? { longitude: data.longitude } : {}),
    ...(imageKeys.length > 0 ? { imageKeys } : {}),
  };
}
