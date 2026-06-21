import { useState } from "react";
import { Alert, View } from "react-native";
import { FileTextIcon, MapPinHouseIcon, PhoneIcon } from "lucide-react-native";
import { useRouter } from "expo-router";
import { KeyboardFormScroll } from "@/components/common/keyboard-form-scroll";
import { Typography } from "@/components/common/typography";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Controller } from "react-hook-form";

import { useNetworkContext } from "@/components/providers/network-provider";
import { useUserAuth } from "@/components/providers/user-auth-provider";
import { PhotoPicker } from "@/components/common/photo-picker";
import { LiveLocationField } from "@/components/common/live-location-field";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { Textarea } from "@/components/ui/textarea";
import { TicketCategory } from "@/features/tickets/types";
import { SERVICE_PHOTO_RAW_MAX_BYTES } from "@/features/service/constants";
import { useCreateUserServiceTicketMutation } from "@/features/service/hooks/use-create-user-service-ticket-mutation";
import { useServiceForm } from "@/features/service/hooks/use-service-form";
import { mapServiceFormToCreateRequest } from "@/features/service/lib/map-create-service-payload";
import { uploadServicePhotos } from "@/features/service/lib/upload-service-photos";
import { isComplaintPhotoStorageKey } from "@/features/service/lib/complaint-photo-storage-key";

import { ServiceDropdownField } from "./service-dropdown-field";

export function ServiceForm({
  serviceId,
  subServices,
  onCancel,
}: {
  serviceId: string;
  subServices: { value: string; label: string }[];
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, userInfo } = useUserAuth();
  const { client } = useNetworkContext();
  const insets = useSafeAreaInsets();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitPhase, setSubmitPhase] = useState<"idle" | "photos" | "submit">("idle");
  const createServiceTicketMutation = useCreateUserServiceTicketMutation();

  const { form, parseFormValues } = useServiceForm({
    serviceId,
    ticketCategory: TicketCategory.SERVICE,
    ward: Number(userInfo?.wardNumber ?? 1),
    phoneNumber: String(userInfo?.phone ?? ""),
  });
  const {
    control,
    formState: { errors },
  } = form;

  const handleSubmit = form.handleSubmit(async (data) => {
    setSubmitError(null);
    const token = session?.accessToken;
    if (!token) {
      Alert.alert(t("service.couldNotSubmit"), t("service.submitSignInRequired"));
      return;
    }

    try {
      const values = parseFormValues(data);
      let imageKeys: string[] | undefined;

      const hasLocalPhotos = values.images.some(
        (uri) =>
          uri.trim().length > 0 &&
          !/^https?:\/\//i.test(uri.trim()) &&
          !isComplaintPhotoStorageKey(uri.trim()),
      );

      if (hasLocalPhotos) {
        setSubmitPhase("photos");
        imageKeys = await uploadServicePhotos(client, token, values.images);
      } else {
        imageKeys = mapServiceFormToCreateRequest(values).imageKeys;
      }

      setSubmitPhase("submit");
      const payload = mapServiceFormToCreateRequest({
        ...values,
        images: imageKeys ?? [],
      });

      const ticket = await createServiceTicketMutation.mutateAsync(payload);

      const photoNote =
        imageKeys && imageKeys.length > 0
          ? t("common.photosAttached", { count: imageKeys.length })
          : "";

      Alert.alert(
        t("service.submitSuccessTitle"),
        t("service.submitSuccessBody", {
          ticketId: ticket.ticketTokenId,
          photoNote,
        }),
        [
          {
            text: t("common.ok"),
            onPress: () => {
              form.reset();
              router.replace({
                pathname: "/user/user-ticket-info-screen",
                params: { ticketId: ticket.id },
              });
            },
          },
        ],
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("service.submitFailed");
      setSubmitError(message);
      Alert.alert(t("service.couldNotSubmit"), message);
    } finally {
      setSubmitPhase("idle");
    }
  });

  return (
    <View className="flex-1 p-4">
      <KeyboardFormScroll
        className="bg-background flex-1"
        footer={
          <>
            {submitError ? (
              <Typography className="text-destructive mb-2 text-center text-sm">
                {submitError}
              </Typography>
            ) : null}

            <View className="flex-row gap-2" style={{ paddingBottom: insets.bottom }}>
              <Button
                variant="destructive"
                size="lg"
                className="w-1/2"
                disabled={createServiceTicketMutation.isPending || submitPhase !== "idle"}
                onPress={onCancel}
              >
                <Typography>{t("common.cancel")}</Typography>
              </Button>
              <Button
                size="lg"
                className="w-1/2"
                disabled={createServiceTicketMutation.isPending || submitPhase !== "idle"}
                onPress={() => void handleSubmit()}
              >
                <Typography>
                  {submitPhase === "photos"
                    ? t("service.uploadingPhotos")
                    : submitPhase === "submit" || createServiceTicketMutation.isPending
                      ? t("service.submitting")
                      : t("service.submitService")}
                </Typography>
              </Button>
            </View>
          </>
        }
      >
        <View className="gap-4 pb-4">
          <ServiceDropdownField
            control={control}
            name="subServiceId"
            options={subServices}
          />

          <Controller
            control={control}
            name="ward"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <View className="gap-1.5">
                <View className="border-input bg-background dark:bg-input/30 flex-row items-center gap-2 rounded-md border px-3 py-2">
                  <Icon as={MapPinHouseIcon} size={18} className="text-primary shrink-0" />
                  <Typography className="text-foreground shrink-0 text-base">Ward:</Typography>
                  <Input
                    placeholder={t("service.wardPlaceholder")}
                    value={value === undefined || value === null ? "" : String(value)}
                    onBlur={onBlur}
                    onChangeText={(text) => onChange(text.replace(/\D/g, ""))}
                    keyboardType="number-pad"
                    className="h-auto min-h-0 flex-1 border-0 bg-transparent p-0 shadow-none"
                  />
                </View>
                {error ? (
                  <Typography className="text-destructive text-sm">{error.message}</Typography>
                ) : null}
              </View>
            )}
          />

          <Controller
            control={control}
            name="phoneNumber"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <View className="gap-1.5 flex-1">
                <View className="border-input bg-background dark:bg-input/30 flex-row items-center gap-2 rounded-md border px-3 py-2">
                  <Icon as={PhoneIcon} size={18} className="text-primary shrink-0" />
                  <Input
                    placeholder={t("service.phonePlaceholder")}
                    value={String(value ?? "")}
                    onBlur={onBlur}
                    onChangeText={(text) => onChange(text.replace(/\D/g, ""))}
                    keyboardType="phone-pad"
                    className="h-auto min-h-0 flex-1 border-0 bg-transparent p-0 shadow-none"
                  />
                </View>
                {error ? (
                  <Typography className="text-destructive text-sm">{error.message}</Typography>
                ) : null}
              </View>
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="gap-1.5">
                <View className="border-input bg-background dark:bg-input/30 flex-row items-start gap-2 rounded-md border px-3 py-2">
                  <Icon as={FileTextIcon} size={20} className="text-primary mt-0.5 shrink-0" />
                  <Textarea
                    placeholder={t("service.descriptionPlaceholder")}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    className="min-h-28 flex-1 border-0 bg-transparent p-0 shadow-none placeholder:text-muted-foreground"
                  />
                </View>
                {errors.description ? (
                  <Typography className="text-destructive text-sm">
                    {errors.description.message}
                  </Typography>
                ) : null}
              </View>
            )}
          />

          <PhotoPicker
            control={control}
            name="images"
            formState={form}
            maxPhotoBytes={SERVICE_PHOTO_RAW_MAX_BYTES}
          />

          <LiveLocationField
            control={control}
            locationAddressName="locationAddress"
            locationSourceName="locationSource"
            latitudeName="latitude"
            longitudeName="longitude"
            formState={form}
          />
        </View>
      </KeyboardFormScroll>
    </View>
  );
}
