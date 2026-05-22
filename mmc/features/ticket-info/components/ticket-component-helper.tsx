import { useState } from "react";
import { Pressable, View } from "react-native";

import { Text } from "../../../components/ui/text";
import { cn } from "../../../lib/utils";

export function ExpandableDescription({
  description,
  className,
}: {
  description: string;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const LINE_HEIGHT = 22;
  const COLLAPSED_MAX_HEIGHT = LINE_HEIGHT * 2.5;

  function textProbablyOverflows(raw: string) {
    const t = raw.trim();
    if (t.length === 0) return false;
    if (t.split(/\n/).length > 3) return true;
    return t.length > 100;
  }

  const showToggle = textProbablyOverflows(description);

  return (
    <View className={cn("mt-3", description)}>
      <Text
        className="text-foreground text-base leading-[22px]"
        style={
          !expanded && showToggle ? { maxHeight: COLLAPSED_MAX_HEIGHT, overflow: "hidden" } : undefined
        }
      >
        {description}
      </Text>
      {showToggle ? (
        <Pressable
          onPress={() => setExpanded((e) => !e)}
          className="self-start"
          accessibilityRole="button"
          accessibilityLabel={expanded ? "Show less description" : "Show more description"}
        >
          <Text className="text-primary text-sm font-semibold">
            {expanded ? "Show less" : "Show more"}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}