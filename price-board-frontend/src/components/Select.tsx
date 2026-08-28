import React, { useState } from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";
import { strings } from "../constants/strings";

export interface SelectOption {
  label: string;
  value: string;
  /** Shows a small red dot next to this option (e.g. "unseen update"). */
  indicator?: boolean;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  value: string | null;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * Single responsibility: a labeled dropdown built only from React Native
 * primitives (no native picker dependency), styled to match FormField.
 */
export function Select({
  label,
  placeholder = strings.select.placeholder,
  value,
  options,
  onChange,
  disabled,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value) ?? null;

  return (
    <View className="mb-5">
      {label ? (
        <Text className="mb-2 text-xs font-semibold tracking-wide text-muted dark:text-muted-dark">
          {label.toUpperCase()}
        </Text>
      ) : null}

      <Pressable
        onPress={() => !disabled && setOpen(true)}
        className={`flex-row items-center justify-between rounded-xl border border-border bg-background px-4 py-3 hover:border-accent dark:border-border-dark dark:bg-background-dark dark:hover:border-accent-dark ${
          disabled ? "opacity-50" : "active:opacity-80"
        }`}
      >
        <Text
          className={
            selected ? "text-base text-primary dark:text-white" : "text-base text-muted dark:text-muted-dark"
          }
        >
          {selected ? selected.label : placeholder}
        </Text>
        <Text className="text-muted dark:text-muted-dark">▾</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 justify-center bg-black/50 px-8" onPress={() => setOpen(false)}>
          <View className="max-h-96 overflow-hidden rounded-2xl bg-card dark:bg-card-dark">
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              ListEmptyComponent={
                <Text className="p-4 text-center text-muted dark:text-muted-dark">
                  {strings.select.noOptions}
                </Text>
              }
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <Pressable
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                    className={`flex-row items-center gap-2 px-4 py-3 hover:opacity-90 active:opacity-70 ${
                      isSelected ? "bg-accent-soft dark:bg-accent-soft-dark" : ""
                    }`}
                  >
                    {item.indicator ? (
                      <View className="h-2 w-2 rounded-full bg-danger dark:bg-danger-dark" />
                    ) : null}
                    <Text
                      className={`text-base ${
                        isSelected
                          ? "font-semibold text-primary dark:text-white"
                          : "text-primary dark:text-white"
                      }`}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              }}
              ItemSeparatorComponent={() => <View className="h-px bg-border dark:bg-border-dark" />}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
