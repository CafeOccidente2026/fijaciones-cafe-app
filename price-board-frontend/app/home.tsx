import React from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/auth/AuthContext";
import { PrimaryButton } from "../src/components/PrimaryButton";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  PRICE_MANAGER: "Encargado de precios",
  PRODUCER: "Productor",
};

/**
 * Placeholder screen. In the next phase this gets replaced by three
 * separate role-specific home screens (Productor / Encargado / Admin).
 */
export default function HomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <Text className="text-xl font-bold text-primary">¡Hola, {user?.fullName}!</Text>
      <Text className="mb-8 text-muted">
        Rol: {user ? ROLE_LABELS[user.role] : ""}
      </Text>
      <View className="w-full">
        <PrimaryButton label="Cerrar sesión" onPress={handleLogout} />
      </View>
    </View>
  );
}
