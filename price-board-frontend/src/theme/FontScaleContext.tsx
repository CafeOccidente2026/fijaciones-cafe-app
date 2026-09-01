import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { rem } from "nativewind";

export type FontScalePreference = "small" | "normal" | "large" | "extraLarge";

const STORAGE_KEY = "priceboard_font_scale_preference";

// NativeWind's default rem base (see react-native-css-interop's unit-observables.ts).
// Every Tailwind text-* class in this project resolves against this value, so
// scaling it here reaches all className-based text app-wide with no per-screen work.
const BASE_REM = 14;

const MULTIPLIERS: Record<FontScalePreference, number> = {
  small: 0.9,
  normal: 1,
  large: 1.15,
  extraLarge: 1.3,
};

interface FontScaleContextValue {
  fontScalePreference: FontScalePreference;
  /** Multiplier for text that isn't reached by the rem scaling below (see AppText). */
  fontScale: number;
  setFontScalePreference: (preference: FontScalePreference) => void;
  /** False until the saved preference has been read from storage. */
  isReady: boolean;
}

const FontScaleContext = createContext<FontScaleContextValue | undefined>(undefined);

function isFontScalePreference(value: string | null): value is FontScalePreference {
  return value === "small" || value === "normal" || value === "large" || value === "extraLarge";
}

/**
 * Single responsibility: own the font-size preference, persist it on the
 * device, and feed it to NativeWind's `rem` unit so every Tailwind text-*
 * class reacts - the same pattern ThemeContext uses for `colorScheme`.
 */
export function FontScaleProvider({ children }: { children: React.ReactNode }) {
  const [fontScalePreference, setFontScalePreferenceState] = useState<FontScalePreference>("normal");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        const preference: FontScalePreference = isFontScalePreference(saved) ? saved : "normal";
        setFontScalePreferenceState(preference);
        rem.set(BASE_REM * MULTIPLIERS[preference]);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  function setFontScalePreference(preference: FontScalePreference) {
    setFontScalePreferenceState(preference);
    rem.set(BASE_REM * MULTIPLIERS[preference]);
    void AsyncStorage.setItem(STORAGE_KEY, preference);
  }

  const value = useMemo<FontScaleContextValue>(
    () => ({
      fontScalePreference,
      fontScale: MULTIPLIERS[fontScalePreference],
      setFontScalePreference,
      isReady,
    }),
    [fontScalePreference, isReady]
  );

  return <FontScaleContext.Provider value={value}>{children}</FontScaleContext.Provider>;
}

export function useFontScale(): FontScaleContextValue {
  const context = useContext(FontScaleContext);
  if (!context) {
    throw new Error("useFontScale debe usarse dentro de un FontScaleProvider");
  }
  return context;
}
