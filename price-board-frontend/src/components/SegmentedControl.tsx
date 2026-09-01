import React from "react";
import { Pressable, Text, View } from "react-native";

interface SegmentedControlOption<T extends string> {
  key: T;
  label: string;
  /** Optional count shown in parentheses next to the label (e.g. unread). */
  count?: number;
}

/**
 * Single responsibility: the two-way (or more) tab switcher used at the
 * top of a screen that shows one of several views - e.g. "Enviadas" /
 * "Recibidas", or "Fijaciones" / "Cambios de precio".
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View className="mb-3 flex-row gap-2">
      {options.map((option) => {
        const active = option.key === value;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            className={`flex-1 items-center rounded-xl border py-2.5 hover:opacity-90 active:opacity-80 ${
              // Light mode: solid coffee-brown pill marks the active tab,
              // solid card cream marks the inactive one. Dark mode
              // untouched (dark: classes unchanged from before).
              active
                ? "border-coffee bg-coffee dark:border-accent-dark dark:bg-accent-soft-dark"
                : "border-border bg-card dark:border-border-dark dark:bg-transparent"
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                // Inactive tab used text-muted in light mode, too pale to
                // read - text-primary fixes it. Active tab text is white in
                // light mode now too, to read on the solid coffee fill.
                active ? "text-white dark:text-white" : "text-primary dark:text-muted-dark"
              }`}
            >
              {option.label}
              {option.count ? (
                <Text className="text-danger dark:text-danger-dark"> ({option.count})</Text>
              ) : null}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
