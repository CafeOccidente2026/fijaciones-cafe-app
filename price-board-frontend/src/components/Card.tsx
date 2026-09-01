import React from "react";
import { Pressable, View } from "react-native";

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
}

/**
 * Single responsibility: the card container used everywhere for list
 * items and panels. When given onPress it becomes pressable, with a
 * subtle press (mobile) and hover (web) cue.
 */
export function Card({ children, onPress, className = "" }: CardProps) {
  // dark:border-metal-silver/20 instead of dark:border-border-dark: a subtle
  // metal edge reinforces the card/background separation in dark mode, on
  // top of card-dark now being lighter than background-dark.
  const base = `rounded-2xl border border-border bg-card p-4 dark:border-metal-silver/20 dark:bg-card-dark ${className}`;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] })}
        className={`${base} hover:border-accent hover:opacity-95 dark:hover:border-accent-dark`}
      >
        {children}
      </Pressable>
    );
  }

  return <View className={base}>{children}</View>;
}
