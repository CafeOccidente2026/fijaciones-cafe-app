import React, { useState } from "react";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../auth/AuthContext";
import { useThemeColors } from "../theme/useThemeColors";
import { strings } from "../constants/strings";

/**
 * Single responsibility: a header icon that logs the user out and sends
 * them to the login screen. Reused in every role's home header (the full
 * "cerrar sesión" flow also lives on the Profile screen).
 */
export function LogoutButton() {
  const router = useRouter();
  const { logout } = useAuth();
  const colors = useThemeColors();
  const [busy, setBusy] = useState(false);

  async function handlePress() {
    if (busy) return;
    setBusy(true);
    await logout();
    router.replace("/login");
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={busy}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={strings.logout.accessibilityLabel}
      className="p-1"
    >
      <Ionicons name="log-out-outline" size={24} color={colors.primary} />
    </Pressable>
  );
}
