import { useCallback, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";

const INACTIVITY_LIMIT_MS = 60 * 1000; // 1 minuto

/**
 * Single responsibility: watch for a period of inactivity while the user
 * is logged in, and log them out (with a callback for showing a message)
 * when the limit is reached. The screen that wraps the app in a
 * <View onTouchStart={resetTimer}> etc. is what feeds activity into this.
 */
export function useInactivityLogout(onTimeout: () => void) {
  const { user, logout } = useAuth();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (!user) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      await logout();
      onTimeout();
    }, INACTIVITY_LIMIT_MS);
  }, [user, logout, onTimeout]);

  useEffect(() => {
    if (user) {
      resetTimer();
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user, resetTimer]);

  return { resetTimer };
}
