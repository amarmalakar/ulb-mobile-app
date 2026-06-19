import { useRef } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { Typography } from "@/components/common/typography";
import type { TicketInfoAuthType, TicketInfoTicket } from "@/features/ticket-info/types";
import { usePatchStaffTicketStatusMutation } from "@/features/tickets/hooks/use-staff-ticket-mutations";
import { usePatchUserTicketStatusMutation } from "@/features/tickets/hooks/use-user-ticket-mutations";
import { useTranslation } from "react-i18next";
import { getLocaleString } from "@/lib/i18n/get-locale-string";
import TicketStatusButton from "./components/ticket-status-button";
import { Separator } from "@/components/ui/separator";
import TicketDescription from "./components/ticket-description";
import { resolveTicketImageUrl } from "@/lib/resolve-ticket-image-url";
import { TicketsTimelines } from "./components/tickets-timelines";
import { TicketStaffInfo } from "./components/ticket-staff-info";
import { TicketUserInfo } from "./components/ticket-user-info";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TicketComments } from "./components/ticket-comments";

export default function TicketInfo({
  ticket,
  authType,
}: {
  ticket: TicketInfoTicket;
  authType: TicketInfoAuthType;
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const commentsScrollY = useRef(0);
  const patchStaffStatus = usePatchStaffTicketStatusMutation();
  const patchUserStatus = usePatchUserTicketStatusMutation();
  const patchStatus = authType === "Staff" ? patchStaffStatus : patchUserStatus;
  const canRate = authType === "User" && ticket.status === "COMPLETED";

  const scrollToComments = () => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, commentsScrollY.current - 16),
        animated: true,
      });
    }, Platform.OS === "ios" ? 250 : 100);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
      >
        <View className="gap-4">
          <View className="px-4 pt-4">
            <View className="flex-row flex-wrap items-start justify-between gap-2">
              <View className="flex-1">
                <Typography variant="h4" className="text-primary">{getLocaleString(ticket.title)}</Typography>
              </View>

              {ticket ? (
                <View className="flex-row items-center gap-2">
                  <TicketStatusButton
                    status={ticket.status}
                    disabled={patchStatus.isPending}
                    onStatusChange={(status) => {
                      void patchStatus
                        .mutateAsync({ ticketId: ticket.id, body: { status } })
                        .catch((e: Error) => {
                          Alert.alert(t("tickets.statusUpdateFailed"), e.message);
                        });
                    }}
                  />
                  {patchStatus.isPending ? <ActivityIndicator /> : null}
                </View>
              ) : null}
            </View>

            <TicketDescription
              description={ticket.description}
              images={ticket.images.map((image) =>
                resolveTicketImageUrl(image.imageUrl || image.imageKey || ""),
              )}
              locationAddress={ticket.locationAddress ?? undefined}
              latitude={ticket.latitude}
              longitude={ticket.longitude}
              rating={ticket.rating}
              canRate={canRate}
              ticketId={ticket.id}
              authType={authType}
            />
          </View>

          <Separator className="my-2" />

          <View className="px-4">
            <Typography variant="h4" className="text-primary pb-2">{t("tickets.timelines")}</Typography>
            <TicketsTimelines timelines={ticket.timelines} />
          </View>

          <Separator className="my-2" />

          <View className="px-4">
            <Typography className="text-primary text-2xl font-bold pb-2">
              {authType === "User" ? t("tickets.assignedTo") : t("tickets.reportedBy")}
            </Typography>
            {authType === "User" ? (
              <TicketStaffInfo staff={ticket.assignedStaff} />
            ) : (
              <TicketUserInfo user={ticket.user} />
            )}
          </View>

          <Separator className="my-2" />

          <View
            className="px-4"
            onLayout={(event) => {
              commentsScrollY.current = event.nativeEvent.layout.y;
            }}
          >
            <Typography variant="h4" className="text-primary pb-2">{t("tickets.comments")}</Typography>
            <TicketComments
              comments={ticket.comments}
              ticketId={ticket.id}
              commentEnabled={ticket.commentEnabled}
              authType={authType}
              onComposerFocus={scrollToComments}
            />
          </View>
        </View>

        <View style={{ paddingBottom: insets.bottom + 12 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
