import React from "react";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../auth/AuthContext";
import { UserRole } from "../types/auth.types";

/**
 * Single responsibility: gate a role's route group. A logged-out user is
 * sent to /login; a user with the wrong role is bounced to /home, which
 * forwards them to their own group.
 */
export function RoleGuard({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#3E2723" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (user.role !== role) {
    return <Redirect href="/home" />;
  }

  return <>{children}</>;
}
