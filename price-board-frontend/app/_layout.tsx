import "../global.css";
import React, { useCallback, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Modal, Text, Pressable } from "react-native";
import { AuthProvider } from "../src/auth/AuthContext";
import { useInactivityLogout } from "../src/auth/useInactivityLogout";
import { useNotificationListeners } from "../src/hooks/useNotificationListeners";
import { ThemeProvider, useTheme } from "../src/theme/ThemeContext";
import { FontScaleProvider, useFontScale } from "../src/theme/FontScaleContext";
import { ScreenBackground } from "../src/components/ScreenBackground";
import { LoadingScreen } from "../src/components/LoadingScreen";
import { strings } from "../src/constants/strings";

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
  useNotificationListeners();

  function acknowledgeAndGoToLogin() {
    setShowTimeoutModal(false);
    router.replace("/login");
  }

  return (
    <View style={{ flex: 1 }} onTouchStart={resetTimer}>
      {children}

      <Modal visible={showTimeoutModal} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/50 px-8">
          <View className="w-full rounded-2xl bg-card p-6 dark:bg-card-dark">
            <Text className="mb-2 text-lg font-bold text-primary dark:text-primary-dark">
              {strings.inactivity.title}
            </Text>
            <Text className="mb-5 text-muted dark:text-muted-dark">{strings.inactivity.message}</Text>
            <Pressable
              onPress={acknowledgeAndGoToLogin}
              className="rounded-xl bg-primary py-3 dark:bg-primary-dark"
            >
              <Text className="text-center font-semibold text-white">
                {strings.inactivity.acknowledge}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/** Holds rendering until the saved theme preference has been read. */
function ThemedApp() {
  const { isReady, resolvedTheme } = useTheme();
  const { isReady: fontScaleReady } = useFontScale();

  if (!isReady || !fontScaleReady) {
    return (
      <ScreenBackground>
        <LoadingScreen />
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <StatusBar style={resolvedTheme === "dark" ? "light" : "dark"} />
      <AuthProvider>
        <InactivityGate>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }} />
        </InactivityGate>
      </AuthProvider>
    </ScreenBackground>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <FontScaleProvider>
          <ThemedApp />
        </FontScaleProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
