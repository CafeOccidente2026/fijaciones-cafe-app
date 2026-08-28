import React, { useState } from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";

export interface SelectOption {
  label: string;
  value: string;
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
  placeholder = "Selecciona una opción",
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
        <Text className="mb-2 text-xs font-semibold tracking-wide text-muted">
          {label.toUpperCase()}
        </Text>
      ) : null}

      <Pressable
        onPress={() => !disabled && setOpen(true)}
        className={`flex-row items-center justify-between rounded-xl border border-border bg-background px-4 py-3 ${
          disabled ? "opacity-50" : ""
        }`}
      >
        <Text className={selected ? "text-base text-primary" : "text-base text-muted"}>
          {selected ? selected.label : placeholder}
        </Text>
        <Text className="text-muted">▾</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          className="flex-1 justify-center bg-black/50 px-8"
          onPress={() => setOpen(false)}
        >
          <View className="max-h-96 overflow-hidden rounded-2xl bg-card">
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              ListEmptyComponent={
                <Text className="p-4 text-center text-muted">No hay opciones disponibles</Text>
              }
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <Pressable
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                    className={`px-4 py-3 ${isSelected ? "bg-accent-light" : ""}`}
                  >
                    <Text className={`text-base ${isSelected ? "font-semibold text-primary" : "text-primary"}`}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              }}
              ItemSeparatorComponent={() => <View className="h-px bg-border" />}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
