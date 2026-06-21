import { useMemo } from "react";
import { Pressable, View } from "react-native";
import { Typography } from "@/components/common/typography";
import { TopNavigation } from "@/components/common/top-navigation";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { getLocaleString } from "@/lib/i18n/get-locale-string";
import { BottomNav } from "@/components/common/bottom-nav";
import { cn } from "@/lib/utils";
import {
  buildStaffTicketsScreenRouteParams,
  parseStaffTicketsRouteParams,
  type StaffTicketsRouteParams,
} from "@/features/tickets/hooks/use-tickets-filter";

export default function StaffTicketsWardScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParamsString = useLocalSearchParams<StaffTicketsRouteParams>();

  const { data } = useMemo(
    () => parseStaffTicketsRouteParams(searchParamsString),
    [searchParamsString.params, searchParamsString.data],
  );

  const title = data?.title;
  const ticketsByWards = data?.ticketsByWards ?? [];

  const color = "teal";

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-background flex-1 gap-4">
        <TopNavigation
          label={title ? getLocaleString(title) : t("tickets.title")}
          isBackButton={true}
        />

        <View className="gap-4 px-4">
          {title ? (
            <Typography variant="h4" className="text-primary">
              {t("tickets.byWardsTitle", { service: getLocaleString(title) })}
            </Typography>
          ) : null}

          <View className="-mx-1 flex-row flex-wrap">
            {ticketsByWards.map((ward) => (
              <Pressable
                className="mb-3 w-1/2 px-1 active:opacity-80 h-[100px]"
                key={ward.ward}
                onPress={() => router.push({
                  pathname: "/staff/staff-tickets-screen",
                  params: buildStaffTicketsScreenRouteParams(searchParamsString, {
                    ward: ward.ward,
                  }),
                })}
              >
                <View
                  className={cn(
                    "relative h-[100px] rounded-2xl border p-3 shadow-sm",
                    `border-${color}-200 bg-${color}-50`,
                  )}
                >
                  <Typography
                    variant="h6"
                    className={cn(`text-${color}-800`)}
                    numberOfLines={2}
                  >
                    {t("common.wardNumber", { ward: ward.ward })}
                  </Typography>

                  <Typography
                    variant="h1"
                    className={cn(`text-${color}-800 mt-3`)}
                  >
                    {ward.tickets}
                    <Typography className={cn(`text-xs font-normal text-${color}-800`)}>
                      {"  "}
                      {t("tickets.openTicketsLabel")}
                    </Typography>
                  </Typography>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        <BottomNav activeItemId="tickets" />
      </View>
    </>
  );
}