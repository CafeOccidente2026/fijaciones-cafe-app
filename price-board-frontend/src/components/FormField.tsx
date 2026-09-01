import React, { useState } from "react";
import { Pressable, TextInput, TextInputProps, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "./AppText";
import { useThemeColors } from "../theme/useThemeColors";
import { strings } from "../constants/strings";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

interface RightIcon {
  name: IoniconName;
  onPress: () => void;
  accessibilityLabel?: string;
}

interface FormFieldProps extends TextInputProps {
  label: string;
  /**
   * Adds an eye button inside the field to reveal/hide the text. The
   * field starts hidden. Built on top of the generic `rightIcon` slot.
   */
  secureToggle?: boolean;
  /** Generic tappable icon shown inside the field, on the right. */
  rightIcon?: RightIcon;
}

/**
 * Single responsibility: one styled labeled text input, reused across
 * every form. Optionally shows a tappable icon on the right (generic, or
 * the password reveal toggle via `secureToggle`).
 */
export function FormField({ label, secureToggle = false, rightIcon, ...inputProps }: FormFieldProps) {
  const colors = useThemeColors();
  const [isHidden, setIsHidden] = useState(true);

  const isSecure = secureToggle ? isHidden : inputProps.secureTextEntry;

  const effectiveRightIcon: RightIcon | undefined = secureToggle
    ? {
        name: isHidden ? "eye-off-outline" : "eye-outline",
        onPress: () => setIsHidden((prev) => !prev),
        accessibilityLabel: isHidden ? strings.auth.showPassword : strings.auth.hidePassword,
      }
    : rightIcon;

  return (
    <View className="mb-5">
      <AppText className="mb-2 text-xs font-semibold tracking-wide text-muted dark:text-muted-dark">
        {label.toUpperCase()}
      </AppText>
      <View>
        <TextInput
          placeholderTextColor={colors.placeholder}
          className={`rounded-xl border border-border bg-background px-4 py-3 text-base text-primary dark:border-border-dark dark:bg-background-dark dark:text-white ${
            effectiveRightIcon ? "pr-12" : ""
          }`}
          {...inputProps}
          secureTextEntry={isSecure}
        />
        {effectiveRightIcon ? (
          <Pressable
            onPress={effectiveRightIcon.onPress}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={effectiveRightIcon.accessibilityLabel}
            className="absolute bottom-0 right-1 top-0 justify-center px-2"
          >
            <Ionicons name={effectiveRightIcon.name} size={20} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
