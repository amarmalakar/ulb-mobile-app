import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { Typography } from "@/components/common/typography";
import { cn } from "@/lib/utils";

export function ExpandableDescription({
  description,
  className,
}: {
  description: string;
  className?: string;
}) {
  const { t } = useTranslation();
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
      <Typography
        className="text-foreground text-base leading-[22px]"
        style={
          !expanded && showToggle ? { maxHeight: COLLAPSED_MAX_HEIGHT, overflow: "hidden" } : undefined
        }
      >
        {description}
      </Typography>
      {showToggle ? (
        <Pressable
          onPress={() => setExpanded((e) => !e)}
          className="self-start"
          accessibilityRole="button"
          accessibilityLabel={
            expanded ? t("tickets.showLessDescription") : t("tickets.showMoreDescription")
          }
        >
          <Typography variant="body2" className="text-primary font-semibold">
            {expanded ? t("tickets.showLess") : t("tickets.showMore")}
          </Typography>
        </Pressable>
      ) : null}
    </View>
  );
}