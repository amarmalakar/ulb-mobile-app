import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronsDownUpIcon, Search, SearchX, X } from "lucide-react-native";
import { FlatList, Modal, Pressable, View } from "react-native";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/text";
import { Separator } from "@/components/ui/separator";

type SelectOption = { value: string; label: string };

export function ComplaintSelectField<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>,
>({
  control,
  name,
  options,
  placeholder,
  title,
}: {
  control: Control<TFieldValues>;
  name: TName;
  options: SelectOption[];
  placeholder?: string;
  title?: string;
}) {
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder ?? t("complaints.selectProblem");
  const resolvedTitle = title ?? t("complaints.selectProblem");

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View className="gap-1.5">
          <ComplaintSelectFieldControl
            options={options}
            value={String(value ?? "")}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={resolvedPlaceholder}
            title={resolvedTitle}
            invalid={Boolean(error)}
          />
          {error ? (
            <Text className="text-destructive text-sm">{error.message}</Text>
          ) : null}
        </View>
      )}
    />
  );
}

function ComplaintSelectFieldControl({
  options,
  value,
  onChange,
  onBlur,
  placeholder,
  title,
  invalid,
}: {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  placeholder: string;
  title: string;
  invalid: boolean;
}) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");

  const selectedOption = options.find((option) => option.value === value);

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return options;
    return options.filter((option) => option.label.toLowerCase().includes(query));
  }, [options, search]);

  const handleClose = () => {
    setSearch("");
    setVisible(false);
    onBlur();
  };

  const handleSelect = (option: SelectOption) => {
    if (option.value === value) {
      onChange("");
      handleClose();
      return;
    }
    onChange(option.value);
    handleClose();
  };

  return (
    <>
      <Modal transparent animationType="fade" visible={visible} onRequestClose={handleClose}>
        <View className="flex-1 justify-end bg-black/30">
          <Pressable className="flex-1" onPress={handleClose} />
          <View className="bg-card absolute bottom-0 h-[60vh] w-full rounded-t-3xl">
            <View className="flex-row items-center justify-between px-4 py-3">
              <Text className="text-primary text-lg font-bold">{title}</Text>
              <Pressable onPress={handleClose} className="bg-muted h-9 w-9 items-center justify-center rounded-full">
                <X size={18} color="#737373" />
              </Pressable>
            </View>

            <Separator />

            <View className="px-4 pt-3">
              <View className="relative">
                <View className="pointer-events-none absolute left-3 top-0 z-10 h-10 justify-center">
                  <Icon as={Search} size={16} className="text-muted-foreground" />
                </View>
                <Input
                  value={search}
                  onChangeText={setSearch}
                  placeholder={t("common.searchProblems")}
                  className="pl-9"
                  autoCorrect={false}
                  autoCapitalize="none"
                  clearButtonMode="while-editing"
                />
              </View>
            </View>

            <View className="flex-1 px-4 pb-4 pt-2">
              {filteredOptions.length === 0 ? (
                <View className="flex-1 items-center justify-center gap-2 px-6">
                  <View className="bg-muted size-14 items-center justify-center rounded-full">
                    <Icon as={SearchX} size={24} className="text-muted-foreground" />
                  </View>
                  <Text className="text-foreground text-center text-base font-semibold">
                    {t("common.noResults")}
                  </Text>
                  <Text className="text-muted-foreground text-center text-sm">
                    {t("complaints.tryDifferentSearch")}
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={filteredOptions}
                  keyExtractor={(item) => item.value}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  ItemSeparatorComponent={() => <View className="h-1.5" />}
                  contentContainerStyle={{ paddingBottom: 8 }}
                  renderItem={({ item }) => {
                    const isSelected = item.value === value;
                    return (
                      <Pressable
                        onPress={() => handleSelect(item)}
                        className={cn(
                          "flex-row items-center justify-between rounded-xl px-3 py-3.5",
                          isSelected ? "bg-primary/10 border border-primary/30" : "bg-muted/60 active:bg-muted"
                        )}
                      >
                        <Text
                          className={cn(
                            "flex-1 pr-3 text-base",
                            isSelected ? "text-primary font-semibold" : "text-foreground font-medium"
                          )}
                        >
                          {item.label}
                        </Text>
                        {isSelected ? (
                          <View className="bg-primary size-6 items-center justify-center rounded-full">
                            <Check size={14} color="#FFFFFF" strokeWidth={3} />
                          </View>
                        ) : null}
                      </Pressable>
                    );
                  }}
                />
              )}
            </View>
          </View>
        </View>
      </Modal>

      <Pressable
        className={cn(
          "flex-row items-center justify-between",
          "bg-background dark:bg-input/30 border rounded-md h-10 w-full min-w-0 px-3 py-1",
          invalid ? "border-destructive" : "border-input"
        )}
        onPress={() => setVisible(true)}
      >
        <Text
          className={cn(
            "flex-1 text-base",
            selectedOption ? "text-foreground" : "text-muted-foreground/50"
          )}
          numberOfLines={1}
        >
          {selectedOption?.label ?? placeholder}
        </Text>
        <Icon as={ChevronsDownUpIcon} size={16} className="text-muted-foreground/50" />
      </Pressable>
    </>
  );
}
