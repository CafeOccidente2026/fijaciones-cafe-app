import React from "react";
import { ActivityIndicator, Pressable } from "react-native";
import { AppText } from "./AppText";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

/**
 * Single responsibility: the app's primary action button. Gives tactile
 * feedback on press (mobile) and a hover cue on web.
 */
export function PrimaryButton({ label, onPress, loading, disabled }: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => ({
        opacity: pressed && !isDisabled ? 0.9 : 1,
        transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }],
      })}
      className={`items-center rounded-2xl py-4 hover:opacity-95 ${
        isDisabled ? "bg-primary/50 dark:bg-primary-dark/50" : "bg-primary dark:bg-primary-dark"
      }`}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <AppText className="text-base font-semibold text-white">{label}</AppText>
      )}
    </Pressable>
  );
}
