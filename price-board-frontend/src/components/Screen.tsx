import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AppText } from "./AppText";
import { strings } from "../constants/strings";

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
 * Single responsibility: the shared page shell - safe area, themed
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
    <View className="mx-4 mt-3 rounded-2xl bg-card/90 px-4 py-3 dark:bg-card-dark/90">
      {showBack ? (
        <Pressable onPress={() => router.back()} className="mb-1 self-start py-1">
          <AppText className="text-sm font-semibold text-primary-light dark:text-accent">
            {strings.common.back}
          </AppText>
        </Pressable>
      ) : null}
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <AppText className="text-2xl font-bold text-primary dark:text-white">{title}</AppText>
          {subtitle ? (
            <AppText className="mt-1 text-sm text-muted dark:text-muted-dark">{subtitle}</AppText>
          ) : null}
        </View>
        {headerRight}
      </View>
    </View>
  ) : null;

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
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
