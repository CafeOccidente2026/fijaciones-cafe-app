import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { PrimaryButton } from "./PrimaryButton";

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
  emptyText = "No hay datos para mostrar.",
  onRetry,
  children,
}: StateViewProps) {
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center py-16">
        <ActivityIndicator size="large" color="#3E2723" />
        <Text className="mt-3 text-muted">Cargando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center gap-4 px-6 py-16">
        <Text className="text-center text-danger">{error}</Text>
        {onRetry ? (
          <View className="w-40">
            <PrimaryButton label="Reintentar" onPress={onRetry} />
          </View>
        ) : null}
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View className="flex-1 items-center justify-center py-16">
        <Text className="text-center text-muted">{emptyText}</Text>
      </View>
    );
  }

  return <>{children}</>;
}
