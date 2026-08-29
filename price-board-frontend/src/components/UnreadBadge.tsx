import React from "react";
import { Text, View } from "react-native";

const MAX_DISPLAY_COUNT = 9;

/**
 * Single responsibility: the small red unread-count pill that mounts on
 * the corner of whatever it's placed inside (an icon, a header button).
 * The parent must be positioned (e.g. `className="relative"`). Renders
 * nothing when there's nothing unread.
 */
export function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  const label = count > MAX_DISPLAY_COUNT ? `${MAX_DISPLAY_COUNT}+` : String(count);

  return (
    <View className="absolute -right-1.5 -top-1.5 h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 dark:bg-danger-dark">
      <Text className="text-[10px] font-bold leading-none text-white">{label}</Text>
    </View>
  );
}
