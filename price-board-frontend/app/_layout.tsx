import "../global.css";
import React, { useCallback, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack, useRouter } from "expo-router";
import { View, Modal, Text, Pressable } from "react-native";
import { AuthProvider } from "../src/auth/AuthContext";
import { useInactivityLogout } from "../src/auth/useInactivityLogout";

/**
 * Wraps every screen so any touch anywhere resets the inactivity timer.
 * When the timer fires, shows a blocking message and sends the user
 * back to the login screen.
 */
function InactivityGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);

  const handleTimeout = useCallback(() => {
    setShowTimeoutModal(true);
  }, []);

  const { resetTimer } = useInactivityLogout(handleTimeout);

  function acknowledgeAndGoToLogin() {
    setShowTimeoutModal(false);
    router.replace("/login");
  }

  return (
    <View style={{ flex: 1 }} onTouchStart={resetTimer}>
      {children}

      <Modal visible={showTimeoutModal} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/50 px-8">
          <View className="w-full rounded-2xl bg-card p-6">
            <Text className="mb-2 text-lg font-bold text-primary">Sesión cerrada</Text>
            <Text className="mb-5 text-muted">
              Pasó mucho tiempo de inactividad. Por seguridad, inicia sesión nuevamente.
            </Text>
            <Pressable onPress={acknowledgeAndGoToLogin} className="rounded-xl bg-primary py-3">
              <Text className="text-center font-semibold text-white">Entendido</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <InactivityGate>
          <Stack screenOptions={{ headerShown: false }} />
        </InactivityGate>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
