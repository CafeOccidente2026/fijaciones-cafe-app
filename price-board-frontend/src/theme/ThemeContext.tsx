import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  colorScheme as nativewindColorScheme,
  useColorScheme as useNativewindColorScheme,
} from "nativewind";

export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "priceboard_theme_preference";

interface ThemeContextValue {
  /** What the user picked: light / dark / follow the system. */
  themePreference: ThemePreference;
  /** The theme actually in effect right now. */
  resolvedTheme: "light" | "dark";
  setThemePreference: (preference: ThemePreference) => void;
  /** False until the saved preference has been read from storage. */
  isReady: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

/**
 * Single responsibility: own the light/dark/system preference, persist it
 * on the device, and feed it to NativeWind so `dark:` classes react.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>("system");
  const [isReady, setIsReady] = useState(false);
  const { colorScheme } = useNativewindColorScheme();

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        const preference: ThemePreference = isThemePreference(saved) ? saved : "system";
        setThemePreferenceState(preference);
        nativewindColorScheme.set(preference);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  function setThemePreference(preference: ThemePreference) {
    setThemePreferenceState(preference);
    nativewindColorScheme.set(preference);
    void AsyncStorage.setItem(STORAGE_KEY, preference);
  }

  const value = useMemo<ThemeContextValue>(
    () => ({
      themePreference,
      resolvedTheme: colorScheme === "dark" ? "dark" : "light",
      setThemePreference,
      isReady,
    }),
    [themePreference, colorScheme, isReady]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe usarse dentro de un ThemeProvider");
  }
  return context;
}
