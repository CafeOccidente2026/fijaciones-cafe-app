import React from "react";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../src/auth/AuthContext";
import { UserRole } from "../src/types/auth.types";

const HOME_BY_ROLE: Record<UserRole, string> = {
  PRODUCER: "/producer",
  PRICE_MANAGER: "/price-manager",
  ADMIN: "/admin",
};

/**
 * Single responsibility: send a logged-in user to the home of their role
 * group. Anything that used to navigate to "/home" keeps working.
 */
export default function Home() {
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

  return <Redirect href={HOME_BY_ROLE[user.role]} />;
}
