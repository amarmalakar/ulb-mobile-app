import { ActivityIndicator, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { TopNavigation } from "@/components/common/top-navigation";
import { useTranslation } from "react-i18next";
import { useUserAuth } from "@/components/providers/user-auth-provider";
import { useUserTicketQuery } from "@/features/tickets/hooks/use-user-ticket-query";
import { Typography } from "@/components/common/typography";
import TicketInfo from "@/features/ticket-info";

export default function UserTicketInfoScreen() {
  const { t } = useTranslation();
  const { sessionHydrated, mpinUnlocked } = useUserAuth();
  const { ticketId } = useLocalSearchParams();
  const { data, isLoading, isError, error } = useUserTicketQuery(ticketId, {
    enabled: sessionHydrated && mpinUnlocked,
  });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-background flex-1">
        <TopNavigation label={t("tickets.ticketInfo")} isBackButton={true} />

        <View className="flex-1">
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" />
            </View>
          ) : isError ? (
            <View className="mx-4 mt-10 items-center rounded-2xl border border-dashed border-destructive bg-muted/30 p-6">
              <Typography className="text-4xl">🎟️</Typography>
              <Typography className="mt-3 text-lg font-semibold text-destructive">{t("tickets.loadErrorTitle")}</Typography>
              <Typography className="mt-1 text-center text-sm text-muted-foreground">
                {error?.message ?? t("tickets.loadErrorHint")}
              </Typography>
            </View>
          ) : !data ? (
            <View className="mx-4 mt-10 items-center rounded-2xl border border-dashed border-muted-foreground/40 bg-muted/30 p-6">
              <Typography className="text-4xl">🎟️</Typography>
              <Typography className="mt-3 text-lg font-semibold text-foreground">{t("tickets.notFoundTitle")}</Typography>
              <Typography className="mt-1 text-center text-sm text-muted-foreground">
                {t("tickets.notFoundHint")}
              </Typography>
            </View>
          ) : (
            <TicketInfo ticket={data} authType="User" />
          )}
        </View>
      </View>
    </>
  );
}
