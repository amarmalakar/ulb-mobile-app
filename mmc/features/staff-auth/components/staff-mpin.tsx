import { Image, ScrollView, View } from "react-native";
import { useTranslation } from "react-i18next";
import bubbleShape1 from "@/assets/images/bubble-shape-1.png";
import loginHero from "@/assets/images/login-hero.png";
import { ArrowLeftIcon } from "lucide-react-native";

import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { MpinForm, type MpinFormProps } from "./mpin-form";
import { useAuthContext } from "@/components/provider/auth-provider";

export type StaffMpinScreenProps = Pick<MpinFormProps, "accessToken" | "onComplete">;

export function StaffMpin({ accessToken, onComplete }: StaffMpinScreenProps) {
  const { t } = useTranslation();
  const { clearAuthType } = useAuthContext();

  return (
    <View className="bg-background flex-1">
      <Image
        source={bubbleShape1}
        resizeMode="contain"
        className="absolute -left-24 -top-20 size-80 opacity-70"
      />

      <ScrollView className="flex-1 px-6 pb-8 pt-20">
        <View className="">
          <Button
            onPress={() => void clearAuthType()}
            variant="ghost"
            className="absolute left-0 z-10 aspect-square rounded-full bg-primary/20 shadow-lg"
          >
            <ArrowLeftIcon size={20} className="" />
          </Button>

          <Typography variant="h4" weight="extrabold" align="center">
            {t("auth.staffMpinTitle")}
          </Typography>
        </View>

        <Image
          source={loginHero}
          resizeMode="contain"
          className="mt-10 h-48 w-full"
        />

        <MpinForm accessToken={accessToken} onComplete={onComplete} />
      </ScrollView>
    </View>
  );
}
