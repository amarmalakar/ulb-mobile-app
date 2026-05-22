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
import { Text } from "@/components/ui/text";
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
}: {
  onRetry: () => void;
  message?: string;
}) {
  return (
    <View className="items-center gap-4 px-4 py-8">
      <View className="bg-destructive/10 size-16 items-center justify-center rounded-full">
        <Icon as={AlertCircleIcon} className="text-destructive" size={32} />
      </View>
      <View className="gap-1.5">
        <Text className="text-destructive text-center text-base font-bold">Something went wrong</Text>
        <Text className="text-muted-foreground text-center text-sm">
          {message ?? "Please try again later."}
        </Text>
      </View>
      <Button size="sm" variant="outline" onPress={onRetry}>
        <Icon as={RefreshCcwIcon} className="size-4" />
        <Text>Retry</Text>
      </Button>
    </View>
  );
}

export function ComplaintList() {
  const router = useRouter();
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
        <Text className="text-xl font-bold text-primary">Complaints</Text>
        <ComplaintListError
          onRetry={() => void refetch()}
          message={error?.message}
        />
      </View>
    );
  }

  const items = complaints ?? [];

  return (
    <View className="gap-4 p-4">
      <Text className="text-xl font-bold text-primary">Complaints</Text>

      {items.length === 0 ? (
        <Text className="text-muted-foreground text-sm">No complaint types available.</Text>
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
                  <Text className="text-center text-foreground text-sm font-medium">{item.title}</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}