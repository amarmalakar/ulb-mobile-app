import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Separator } from "@/components/ui/separator";
import { usePatchStaffTicketStatusMutation } from "@/features/tickets/hooks/use-staff-ticket-queries";
import TicketDescription from "./components/ticket-description";
import { TicketsTimelines } from "./components/tickets-timelines";
import { TicketStaffInfo } from "./components/ticket-staff-info";
import { TicketUserInfo } from "./components/ticket-user-info";
import { TicketComments } from "./components/ticket-comments";
import { resolveTicketImageUrl } from "./lib/resolve-ticket-image-url";
import type { TicketInfoAuthType, TicketInfoTicket } from "./types";
import TicketStatusButton from "./components/ticket-status-button";

export default function TicketInfo({
  ticket,
  authType,
}: {
  ticket: TicketInfoTicket;
  authType: TicketInfoAuthType;
}) {
  const canRate = authType === "User" && ticket.status === "COMPLETED";
  const patchStatus = usePatchStaffTicketStatusMutation();

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="gap-4">
        <View className="px-4 pt-4">
          <View className="flex-row flex-wrap items-center justify-between">
            <Text className="text-foreground text-2xl font-bold">{ticket.title}</Text>

            {ticket ? (
              <View className="flex-row items-center gap-2">
                <TicketStatusButton
                  status={ticket.status}
                  disabled={patchStatus.isPending}
                  onStatusChange={(status) => {
                    void patchStatus
                      .mutateAsync({ ticketId: ticket.id, body: { status } })
                      .catch((e: Error) => {
                        Alert.alert("Could not update status", e.message);
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
          <Text className="text-primary text-2xl font-bold pb-2">Timelines</Text>
          <TicketsTimelines timelines={ticket.timelines} />
        </View>

        <Separator className="my-2" />

        <View className="px-4">
          <Text className="text-primary text-2xl font-bold pb-2">
            {authType === "User" ? "Assigned To" : "Reported By"}
          </Text>
          {authType === "User" ? (
            <TicketStaffInfo staff={ticket.assignedStaff} />
          ) : (
            <TicketUserInfo user={ticket.user} />
          )}
        </View>

        <Separator className="my-2" />

        <View className="px-4">
          <Text className="text-primary text-2xl font-bold pb-2">Comments</Text>
          <TicketComments
            comments={ticket.comments}
            ticketId={ticket.id}
            commentEnabled={ticket.commentEnabled}
            authType={authType}
          />
        </View>
      </View>
    </ScrollView>
  );
}
