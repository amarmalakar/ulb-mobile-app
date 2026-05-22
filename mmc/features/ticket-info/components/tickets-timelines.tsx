import type { StaffTicketTimelineEntry, UserTicketTimelineEntry } from "@/features/tickets/types";
import { format, isValid, parseISO } from "date-fns";
import { enGB } from "date-fns/locale";
import { useMemo } from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";

function formatTimelineTime(value: string) {
  const parsed = parseISO(value);
  if (!isValid(parsed)) {
    return value;
  }

  const datePart = format(parsed, "dd MMM yyyy", { locale: enGB }).toUpperCase();
  const timePart = format(parsed, "h:mm a").replace(/\s/g, "");

  return `${datePart}, ${timePart}`;
}

export function TicketsTimelines({
  timelines,
}: {
  timelines: UserTicketTimelineEntry[] | StaffTicketTimelineEntry[];
}) {
  const sorted = useMemo(
    () =>
      [...timelines].sort(
        (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime(),
      ),
    [timelines],
  );

  return (
    <View className="pl-2 pr-4 pt-6">
      {sorted.map((item, index) => {
        const isLast = index === sorted.length - 1;

        return (
          <View key={item.id} className="min-h-20 flex-row">
            <View className="items-center">
              <View className="h-5 w-5 rounded-full border-2 border-primary bg-background" />
              {!isLast ? <View className="mt-1 w-0.5 flex-1 bg-foreground/80" /> : null}
            </View>

            <View className="ml-5 flex-1 pb-8">
              <Text className="text-xs font-semibold uppercase tracking-wide text-sky-600">
                {formatTimelineTime(item.occurredAt)}
              </Text>
              <Text className="font-semibold text-foreground">
                {item.description}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}