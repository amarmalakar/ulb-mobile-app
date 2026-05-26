import { ActivityIndicator, ScrollView, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Typography } from "@/components/ui/typography";
import { Stack, useLocalSearchParams } from "expo-router";
import { useStaffTicketQuery } from "@/features/tickets/hooks/use-staff-ticket-queries";
import { TopNavigation } from "@/components/common/top-navigation";
import TicketInfo from "@/features/ticket-info";

export default function StaffTicketInfoScreen() {
  const { t } = useTranslation();
  const { ticketId } = useLocalSearchParams();
  const { data, isLoading, isError, error, isRefetching } = useStaffTicketQuery(ticketId);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="bg-background flex-1">
        <TopNavigation label={t("tickets.ticketInfo")} isBackButton={true} />

        <ScrollView>
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
          ) : data ? (
            <TicketInfo ticket={data} authType="Staff" />
          ) : (
            <View className="mx-4 mt-10 items-center rounded-2xl border border-dashed border-muted-foreground/40 bg-muted/30 p-6">
              <Typography className="text-4xl">🎟️</Typography>
              <Typography className="mt-3 text-lg font-semibold text-foreground">{t("tickets.notFoundTitle")}</Typography>
              <Typography className="mt-1 text-center text-sm text-muted-foreground">
                {t("tickets.notFoundHint")}
              </Typography>
            </View>
          )}
        </ScrollView >
      </View >
    </>
  );
}