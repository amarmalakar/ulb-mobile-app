import {
  StyleSheet,
  Text as RNText,
  TouchableOpacity,
  View,
} from "react-native";
import type { ContactMethod } from "../types";

interface ContactMethodOption {
  id: ContactMethod;
  label: string;
}

const OPTIONS: ContactMethodOption[] = [
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
];

interface ContactMethodToggleProps {
  value: ContactMethod;
  onChange: (next: ContactMethod) => void;
  disabled?: boolean;
}

export function ContactMethodToggle({
  value,
  onChange,
  disabled = false,
}: ContactMethodToggleProps) {
  return (
    <View style={styles.row}>
      {OPTIONS.map((option) => {
        const isActive = value === option.id;
        return (
          <TouchableOpacity
            key={option.id}
            activeOpacity={0.7}
            onPress={() => onChange(option.id)}
            disabled={disabled}
          >
            <View
              style={[
                styles.pill,
                isActive && styles.pillActive,
                disabled && styles.pillDisabled,
              ]}
            >
              <RNText
                style={[
                  styles.label,
                  isActive ? styles.labelActive : styles.labelInactive,
                ]}
              >
                {option.label}
              </RNText>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
const styles = StyleSheet.create({
  row: {
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 4,
    borderRadius: 9999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e5e5",
    backgroundColor: "rgba(245, 245, 245, 0.5)",
    padding: 4,
  },
  pill: {
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  pillActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pillDisabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 14,
  },
  labelActive: {
    color: "#0a0a0a",
    fontWeight: "600",
  },
  labelInactive: {
    color: "#737373",
    fontWeight: "500",
  },
});

