import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { PrimaryButton } from "./PrimaryButton";
import { useThemeColors } from "../theme/useThemeColors";
import { strings } from "../constants/strings";

interface StateViewProps {
  isLoading: boolean;
  error: string | null;
  /** True when the request succeeded but there is nothing to show. */
  isEmpty?: boolean;
  emptyText?: string;
  onRetry?: () => void;
  children: React.ReactNode;
}

/**
 * Single responsibility: render the loading spinner, the error message
 * (with a retry button) or the empty-state text, and otherwise show the
 * screen's real content. Keeps every data screen from going blank.
 */
export function StateView({
  isLoading,
  error,
  isEmpty,
  emptyText = strings.common.noData,
  onRetry,
  children,
}: StateViewProps) {
  const colors = useThemeColors();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center py-16">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-3 text-muted dark:text-muted-dark">{strings.common.loading}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center gap-4 px-6 py-16">
        <Text className="text-center text-danger dark:text-danger-dark">{error}</Text>
        {onRetry ? (
          <View className="w-40">
            <PrimaryButton label={strings.common.retry} onPress={onRetry} />
          </View>
        ) : null}
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View className="flex-1 items-center justify-center py-16">
        <Text className="text-center text-muted dark:text-muted-dark">{emptyText}</Text>
      </View>
    );
  }

  return <>{children}</>;
}
