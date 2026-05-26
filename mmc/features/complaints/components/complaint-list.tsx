import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import {
  AlertCircleIcon,
  BrushCleaningIcon,
  Columns4Icon,
  DropletIcon,
  PawPrintIcon,
  RefreshCcwIcon,
  UtilityPoleIcon,
  type LucideIcon,
} from "lucide-react-native";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { useTranslation } from "react-i18next";
import { useUserComplaintQueries } from "@/features/complaints/hooks/use-user-complaint-queries";
import { cn } from "@/lib/utils";

type ComplaintTheme = {
  icon: LucideIcon;
  containerClass: string;
  iconColor: string;
};

const complaintThemes: Record<string, ComplaintTheme> = {
  Enforcement: {
    icon: Columns4Icon,
    containerClass: "border-violet-200 bg-violet-100",
    iconColor: "#7C3AED",
  },
  Swachhata: {
    icon: BrushCleaningIcon,
    containerClass: "border-emerald-200 bg-emerald-100",
    iconColor: "#059669",
  },
  Water: {
    icon: DropletIcon,
    containerClass: "border-sky-200 bg-sky-100",
    iconColor: "#0284C7",
  },
  "Pet Control": {
    icon: PawPrintIcon,
    containerClass: "border-amber-200 bg-amber-100",
    iconColor: "#D97706",
  },
  Electricity: {
    icon: UtilityPoleIcon,
    containerClass: "border-orange-200 bg-orange-100",
    iconColor: "#EA580C",
  },
};

const defaultTheme: ComplaintTheme = {
  icon: Columns4Icon,
  containerClass: "border-primary/30 bg-primary/15",
  iconColor: "#0EA5E9",
};

function ComplaintListError({
  onRetry,
  message,
  title,
  retryLabel,
  defaultMessage,
}: {
  onRetry: () => void;
  message?: string;
  title: string;
  retryLabel: string;
  defaultMessage: string;
}) {
  return (
    <View className="items-center gap-4 px-4 py-8">
      <View className="bg-destructive/10 size-16 items-center justify-center rounded-full">
        <Icon as={AlertCircleIcon} className="text-destructive" size={32} />
      </View>
      <View className="gap-1.5">
        <Typography className="text-destructive text-center text-base font-bold">{title}</Typography>
        <Typography className="text-muted-foreground text-center text-sm">
          {message ?? defaultMessage}
        </Typography>
      </View>
      <Button size="sm" variant="outline" onPress={onRetry}>
        <Icon as={RefreshCcwIcon} className="size-4" />
        <Typography>{retryLabel}</Typography>
      </Button>
    </View>
  );
}

export function ComplaintList() {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: complaints, isLoading, isError, error, refetch } = useUserComplaintQueries();

  if (isLoading) {
    return (
      <View className="gap-4 p-4">
        <Skeleton className="h-6 w-56" />
        <View className="flex-row flex-wrap gap-y-4">
          {new Array(7).fill(0).map((_, index) => (
            <View key={index} className="w-1/4">
              <View className="self-center items-center gap-2">
                <Skeleton className="h-14 w-14 items-center justify-center rounded-full" />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="gap-4 p-4">
        <Typography className="text-xl font-bold text-primary">{t('complaints.title')}</Typography>
        <ComplaintListError
          onRetry={() => void refetch()}
          message={error?.message}
          title={t('common.errorTitle')}
          retryLabel={t('common.retry')}
          defaultMessage={t('common.errorDefault')}
        />
      </View>
    );
  }

  const items = complaints ?? [];

  return (
    <View className="gap-4 p-4">
      <Typography className="text-xl font-bold text-primary">{t('complaints.title')}</Typography>

      {items.length === 0 ? (
        <Typography className="text-muted-foreground text-sm">{t('complaints.empty')}</Typography>
      ) : (
        <View className="flex-row flex-wrap gap-y-4">
          {items.map((item) => {
            const theme = complaintThemes[item.title] ?? defaultTheme;
            const Icon = theme.icon;

            return (
              <View key={item.id} className="w-1/4">
                <Pressable
                  className="self-center items-center gap-2 active:opacity-80"
                  onPress={() => router.push({
                    pathname: '/user/complaint-form-screen',
                    params: {
                      params: JSON.stringify({
                        complaintId: item.id,
                        complaintTitle: item.title,
                        subComplaints: item.subComplaints
                      })
                    },
                  })}
                >
                  <View
                    className={cn(
                      "h-14 w-14 items-center justify-center rounded-full border",
                      theme.containerClass,
                    )}
                  >
                    <Icon size={24} color={theme.iconColor} />
                  </View>
                  <Typography className="text-center text-foreground text-sm font-medium">{item.title}</Typography>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}