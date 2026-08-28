import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

interface ScreenProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  /** When false, content is not wrapped in a ScrollView (e.g. it has its own FlatList). */
  scroll?: boolean;
  /** Extra node rendered on the right side of the header (e.g. an action button). */
  headerRight?: React.ReactNode;
  /** Show a "‹ Volver" link above the title (for detail screens). */
  showBack?: boolean;
}

/**
 * Single responsibility: the shared page shell - safe area, cream
 * background, optional title header - so every role screen looks the same.
 */
export function Screen({
  children,
  title,
  subtitle,
  scroll = true,
  headerRight,
  showBack = false,
}: ScreenProps) {
  const router = useRouter();

  const header = title ? (
    <View className="px-5 pb-2 pt-4">
      {showBack ? (
        <Pressable onPress={() => router.back()} className="mb-1 self-start py-1">
          <Text className="text-sm font-semibold text-primary-light">‹ Volver</Text>
        </Pressable>
      ) : null}
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-2xl font-bold text-primary">{title}</Text>
          {subtitle ? <Text className="mt-1 text-sm text-muted">{subtitle}</Text> : null}
        </View>
        {headerRight}
      </View>
    </View>
  ) : null;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {header}
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingTop: title ? 8 : 20, gap: 12 }}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View className="flex-1 px-5 pt-2">{children}</View>
      )}
    </SafeAreaView>
  );
}
