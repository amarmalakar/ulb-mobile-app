import { useNetworkContext } from "@/components/provider/network-provider";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

import { Controller } from "react-hook-form";
import { useUserAuth } from "@/components/provider/user-auth-provider";
import { TicketCategory } from "@/features/tickets/types";

import { useComplaintForm } from "@/features/complaints/hooks/use-complaint-form";
import { useCreateUserComplaintTicketMutation } from "@/features/complaints/hooks/use-user-complaint-queries";
import { uploadComplaintPhotos } from "../lib/upload-complaint-photos";
import { mapComplaintFormToCreateRequest } from "../lib/map-create-complaint-payload";
import { ComplaintSelectField } from "./complaint-select-field";
import { PhotoPicker } from "@/components/common/photo-picker";
import { LiveLocationField } from "@/components/common/live-location-field";

export function ComplaintForm({
  complaintId,
  subComplaints,
  onCancel,
}: {
  complaintId: string;
  subComplaints: string[];
  onCancel: () => void;
}) {
  const router = useRouter();
  const { session, userInfo } = useUserAuth();
  const { client } = useNetworkContext();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitPhase, setSubmitPhase] = useState<"idle" | "photos" | "submit">("idle");
  const createComplaintMutation = useCreateUserComplaintTicketMutation();
  const { form, parseFormValues } = useComplaintForm({
    phoneNumber: String(userInfo?.phone ?? ""),
    ward: Number(userInfo?.wardNumber ?? 1),
    ticketCategory: TicketCategory.COMPLIANT,
    complaintId,
  });
  const {
    control,
    formState: { errors },
  } = form;

  const handleSubmit = form.handleSubmit(async (data) => {
    setSubmitError(null);
    const token = session?.accessToken;
    if (!token) {
      Alert.alert("Could not submit", "You must be signed in to submit a complaint");
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
        imageKeys = await uploadComplaintPhotos(client, token, values.images);
      } else {
        imageKeys = mapComplaintFormToCreateRequest(values).imageKeys;
      }

      setSubmitPhase("submit");
      const payload = mapComplaintFormToCreateRequest({
        ...values,
        images: imageKeys ?? [],
      });

      const ticket = await createComplaintMutation.mutateAsync(payload);

      const photoNote =
        imageKeys && imageKeys.length > 0
          ? `\n${imageKeys.length} photo(s) attached.`
          : "";

      Alert.alert(
        "Complaint submitted",
        `Complaint submitted successfully.\nTicket ID: ${ticket.ticketTokenId}${photoNote}`,
        [
          {
            text: "OK", onPress: () => {
              form.reset();
              router.push("/user/user-tickets-screen")
            }
          },
        ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to submit complaint";
      setSubmitError(message);
      Alert.alert("Could not submit", message);
    } finally {
      setSubmitPhase("idle");
    }
  });

  type SubComplaintOption = { value: string; label: string };

  const subCategoryOptions = useMemo<SubComplaintOption[]>(
    () => subComplaints.map((label) => ({ value: label, label })),
    [subComplaints],
  );

  const insets = useSafeAreaInsets();

  return (
    <>
      <View className="flex-1 p-4">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 bg-background"
          style={{ paddingBottom: insets.bottom }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="gap-4 pb-28">
              <ComplaintSelectField
                control={control}
                name="title"
                options={subCategoryOptions}
              />

              <View className="flex-row gap-2">
                <Controller
                  control={control}
                  name="ward"
                  render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                    <View className="gap-1.5 w-32">
                      <Input
                        placeholder="Ward number"
                        value={value === undefined || value === null ? "" : String(value)}
                        onBlur={onBlur}
                        onChangeText={(text) => onChange(text.replace(/\D/g, ""))}
                        keyboardType="number-pad"
                      />
                      {error ? (
                        <Text className="text-destructive text-sm">{error.message}</Text>
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
                        placeholder="Phone number"
                        value={String(value ?? "")}
                        onBlur={onBlur}
                        onChangeText={(text) => onChange(text.replace(/\D/g, ""))}
                        keyboardType="phone-pad"
                      />
                      {error ? (
                        <Text className="text-destructive text-sm">{error.message}</Text>
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
                      placeholder="Enter complaint description"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      className="min-h-28"
                    />
                    {errors.description ? (
                      <Text className="text-destructive text-sm">{errors.description.message}</Text>
                    ) : null}
                  </View>
                )}
              />

              <PhotoPicker
                control={control}
                name="images"
                formState={form}
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
          </ScrollView>
        </KeyboardAvoidingView>

        {submitError ? (
          <Text className="text-destructive mb-2 text-center text-sm">{submitError}</Text>
        ) : null}

        <View className="flex-row gap-2 ">
          <Button
            variant="destructive"
            size="lg"
            className="w-1/2"
            disabled={createComplaintMutation.isPending || submitPhase !== "idle"}
            onPress={onCancel}
          >
            <Text>Cancel</Text>
          </Button>
          <Button
            size="lg"
            className="w-1/2"
            disabled={createComplaintMutation.isPending || submitPhase !== "idle"}
            onPress={() => void handleSubmit()}
          >
            <Text>
              {submitPhase === "photos"
                ? "Uploading photos…"
                : submitPhase === "submit" || createComplaintMutation.isPending
                  ? "Submitting…"
                  : "Submit"}
            </Text>
          </Button>
        </View>
      </View>
    </>
  );
}
