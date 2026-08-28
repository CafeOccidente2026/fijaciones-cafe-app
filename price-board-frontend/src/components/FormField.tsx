import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface FormFieldProps extends TextInputProps {
  label: string;
}

/**
 * Single responsibility: one styled labeled text input, reused across
 * every form in the app (login, create user, etc.) for visual consistency.
 */
export function FormField({ label, ...inputProps }: FormFieldProps) {
  return (
    <View className="mb-5">
      <Text className="mb-2 text-xs font-semibold tracking-wide text-muted">
        {label.toUpperCase()}
      </Text>
      <TextInput
        placeholderTextColor="#B79A94"
        className="rounded-xl border border-border bg-background px-4 py-3 text-base text-primary"
        {...inputProps}
      />
    </View>
  );
}
