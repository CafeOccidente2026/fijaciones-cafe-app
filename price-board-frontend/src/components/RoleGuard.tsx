import React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "../auth/AuthContext";
import { UserRole } from "../types/auth.types";
import { LoadingScreen } from "./LoadingScreen";

/**
 * Single responsibility: gate a role's route group. A logged-out user is
 * sent to /login; a user with the wrong role is bounced to /home, which
 * forwards them to their own group.
 */
export function RoleGuard({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (user.role !== role) {
    return <Redirect href="/home" />;
  }

  return <>{children}</>;
}
