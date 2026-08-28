import React from "react";
import { Pressable, View } from "react-native";

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
}

/**
 * Single responsibility: the white rounded container used everywhere for
 * list items and panels. Becomes pressable when given onPress.
 */
export function Card({ children, onPress, className = "" }: CardProps) {
  const base = `rounded-2xl bg-card p-4 shadow-sm ${className}`;

  if (onPress) {
    return (
      <Pressable onPress={onPress} className={`${base} active:opacity-80`}>
        {children}
      </Pressable>
    );
  }

  return <View className={base}>{children}</View>;
}
