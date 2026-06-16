import { useState } from "react";
import { Alert, View } from "react-native";
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
import { Textarea } from "@/components/ui/textarea";
import { TicketCategory } from "@/features/tickets/types";
import { SERVICE_PHOTO_RAW_MAX_BYTES } from "@/features/service/constants";
import { useCreateUserServiceTicketMutation } from "@/features/service/hooks/use-create-user-service-ticket-mutation";
import { useServiceForm } from "@/features/service/hooks/use-service-form";
import { mapServiceFormToCreateRequest } from "@/features/service/lib/map-create-service-payload";
import { uploadServicePhotos } from "@/features/service/lib/upload-service-photos";

import { ServiceSelectField } from "./service-select-field";

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
      Alert.alert(t("complaints.couldNotSubmit"), t("complaints.submitSignInRequired"));
      return;
    }

    try {
      const values = parseFormValues(data);
      let imageKeys: string[] | undefined;

      const hasLocalPhotos = values.images.some(
        (uri) =>
          uri.trim().length > 0 &&
          !/^https?:\/\//i.test(uri.trim()) &&
          !uri.trim().startsWith("complaint-photos/"),
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
        t("complaints.submitSuccessTitle"),
        t("complaints.submitSuccessBody", {
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
        error instanceof Error ? error.message : t("complaints.submitFailed");
      setSubmitError(message);
      Alert.alert(t("complaints.couldNotSubmit"), message);
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
                    ? t("complaints.uploadingPhotos")
                    : submitPhase === "submit" || createServiceTicketMutation.isPending
                      ? t("complaints.submitting")
                      : t("complaints.submitComplaint")}
                </Typography>
              </Button>
            </View>
          </>
        }
      >
        <View className="gap-4 pb-4">
          <ServiceSelectField
            control={control}
            name="subServiceId"
            options={subServices}
          />

          <View className="flex-row gap-2">
            <Controller
              control={control}
              name="ward"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View className="gap-1.5 w-32">
                  <Input
                    placeholder={t("complaints.wardPlaceholder")}
                    value={value === undefined || value === null ? "" : String(value)}
                    onBlur={onBlur}
                    onChangeText={(text) => onChange(text.replace(/\D/g, ""))}
                    keyboardType="number-pad"
                  />
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
                  <Input
                    placeholder={t("complaints.phonePlaceholder")}
                    value={String(value ?? "")}
                    onBlur={onBlur}
                    onChangeText={(text) => onChange(text.replace(/\D/g, ""))}
                    keyboardType="phone-pad"
                  />
                  {error ? (
                    <Typography className="text-destructive text-sm">{error.message}</Typography>
                  ) : null}
                </View>
              )}
            />
          </View>

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="gap-1.5">
                <Textarea
                  placeholder={t("complaints.descriptionPlaceholder")}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  className="min-h-28"
                />
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
