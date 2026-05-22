import { ActivityIndicator, ScrollView, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import { TopNavigation } from "@/components/common/top-navigation";
import { Stack, useLocalSearchParams } from "expo-router";
import { useUserTicketQuery } from "@/features/tickets/hooks/use-ticket-queries";
import TicketInfo from "@/features/ticket-info";

export default function UserTicketInfoScreen() {
  const { t } = useTranslation();
  const { ticketId } = useLocalSearchParams();
  const { data, isLoading, isError, error } = useUserTicketQuery(ticketId);

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
              <Text className="text-4xl">🎟️</Text>
              <Text className="mt-3 text-lg font-semibold text-destructive">{t("tickets.loadErrorTitle")}</Text>
              <Text className="mt-1 text-center text-sm text-muted-foreground">
                {error?.message ?? t("tickets.loadErrorHint")}
              </Text>
            </View>
          ) : data ? (
            <TicketInfo ticket={data} authType="User" />
          ) : (
            <View className="mx-4 mt-10 items-center rounded-2xl border border-dashed border-muted-foreground/40 bg-muted/30 p-6">
              <Text className="text-4xl">🎟️</Text>
              <Text className="mt-3 text-lg font-semibold text-foreground">{t("tickets.notFoundTitle")}</Text>
              <Text className="mt-1 text-center text-sm text-muted-foreground">
                {t("tickets.notFoundHint")}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}
