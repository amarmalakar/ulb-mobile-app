import { Alert, Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";
import { StarIcon } from "lucide-react-native";

import { Text } from "@/components/ui/text";
import { useUserAuth } from "@/components/provider/user-auth-provider";
import { usePutUserTicketRatingMutation } from "@/features/tickets/hooks/use-ticket-queries";

export function TicketUserRating({
  ticketId,
  rating,
  canRate,
}: {
  ticketId: string;
  rating: number | null | undefined;
  canRate: boolean;
}) {
  const { t } = useTranslation();
  const { session } = useUserAuth();
  const { isPending: isRatingUpdating, mutate: rateTicket } = usePutUserTicketRatingMutation();
  const displayRating = rating ?? 0;

  if (!canRate) {
    return null;
  }

  return (
    <View className="rounded-xl bg-card p-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-muted-foreground">{t("tickets.rateTicket")}</Text>
        <Text className="text-sm font-medium text-foreground">
          {isRatingUpdating
            ? t("tickets.updating")
            : displayRating > 0
              ? t("tickets.ratingScore", { rating: displayRating })
              : t("tickets.notRated")}
        </Text>
      </View>
      <View className="mt-2 flex-row items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => {
          const active = star <= displayRating;
          return (
            <Pressable
              key={star}
              onPress={() =>
                rateTicket(
                  { ticketId, body: { rating: star } },
                  {
                    onError: (err: Error) => {
                      Alert.alert(t("tickets.couldNotSaveRating"), err.message);
                    },
                  },
                )
              }
              disabled={isRatingUpdating || !session?.accessToken}
              className="rounded-full p-1"
            >
              <StarIcon
                size={22}
                color={active ? "#F59E0B" : "#94A3B8"}
                fill={active ? "#F59E0B" : "transparent"}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
