import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronDown } from "lucide-react-native";
import { Pressable, ScrollView, View, type LayoutChangeEvent } from "react-native";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

import { Typography } from "@/components/common/typography";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export type ServiceDropdownOption = { value: string; label: string };

export function ServiceDropdownField<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>,
>({
  control,
  name,
  options,
  placeholder,
}: {
  control: Control<TFieldValues>;
  name: TName;
  options: ServiceDropdownOption[];
  placeholder?: string;
}) {
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder ?? t("complaints.selectProblem");

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <ServiceDropdownFieldControl
          options={options}
          value={String(value ?? "")}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={resolvedPlaceholder}
          invalid={Boolean(error)}
          errorMessage={error?.message}
        />
      )}
    />
  );
}

function ServiceDropdownFieldControl({
  options,
  value,
  onChange,
  onBlur,
  placeholder,
  invalid,
  errorMessage,
}: {
  options: ServiceDropdownOption[];
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  placeholder: string;
  invalid: boolean;
  errorMessage?: string;
}) {
  const [triggerWidth, setTriggerWidth] = useState(0);
  const selectedOption = options.find((option) => option.value === value);

  const onTriggerLayout = (event: LayoutChangeEvent) => {
    setTriggerWidth(event.nativeEvent.layout.width);
  };

  return (
    <View className="gap-1.5">
      <DropdownMenu
        onOpenChange={(open) => {
          if (!open) {
            onBlur();
          }
        }}
      >
        <DropdownMenuTrigger asChild>
          <Pressable
            onLayout={onTriggerLayout}
            className={cn(
              "flex-row items-center justify-between",
              "bg-background dark:bg-input/30 h-10 w-full min-w-0 rounded-md border px-3 py-2",
              invalid ? "border-destructive" : "border-input",
            )}
          >
            <Typography
              className={cn(
                "flex-1 text-base",
                selectedOption ? "text-foreground" : "text-muted-foreground/50",
              )}
              numberOfLines={1}
            >
              {selectedOption?.label ?? placeholder}
            </Typography>
            <Icon as={ChevronDown} size={20} className="text-primary" />
          </Pressable>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          sideOffset={4}
          className="p-0"
          overlayClassName="shadow-lg"
          style={triggerWidth > 0 ? { width: triggerWidth } : undefined}
        >
          <ScrollView
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 380 }}
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <DropdownMenuItem
                  key={option.value}
                  onPress={() => onChange(option.value)}
                  className={cn(
                    "min-h-11 rounded-none px-3 py-2.5",
                    isSelected && "bg-accent",
                  )}
                >
                  <Typography
                    className={cn(
                      "flex-1 text-sm",
                      isSelected ? "text-primary font-semibold" : "text-foreground",
                    )}
                    numberOfLines={2}
                  >
                    {option.label}
                  </Typography>
                  {isSelected ? (
                    <Icon as={Check} className="text-primary size-4 shrink-0" />
                  ) : null}
                </DropdownMenuItem>
              );
            })}
          </ScrollView>
        </DropdownMenuContent>
      </DropdownMenu>

      {errorMessage ? (
        <Typography className="text-destructive text-sm">{errorMessage}</Typography>
      ) : null}
    </View>
  );
}
