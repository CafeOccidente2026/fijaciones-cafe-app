import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AuthApi } from "../api/authApi";
import { UsersApi } from "../api/usersApi";
import { SecureTokenStorage } from "./secureTokenStorage";
import { registerSessionExpiredHandler } from "../api/httpClient";
import { registerForPushNotificationsAsync } from "../notifications/pushRegistration";
import { AuthUser } from "../types/auth.types";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Merge fields into the current user in memory (e.g. new profile photo). */
  updateUser: (patch: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Remembers the token we registered so logout can remove that same one.
  const deviceTokenRef = useRef<string | null>(null);

  // On app start: if there's a saved access token, we still ask the user
  // to log in again for now (session restore across app restarts can be
  // added later by calling a "/me" endpoint). We only clear stale tokens.
  useEffect(() => {
    (async () => {
      const accessToken = await SecureTokenStorage.getAccessToken();
      if (!accessToken) {
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
    })();
  }, []);

  // If httpClient fails to refresh the token anywhere in the app, it
  // calls this to force the user back to the login screen.
  useEffect(() => {
    registerSessionExpiredHandler(() => {
      setUser(null);
      SecureTokenStorage.clearTokens();
    });
  }, []);

  // Registers this device for push once there's a logged-in user, not as
  // part of login() itself - it must also run after the session-restore
  // path once that's added, and a failure here must never block login.
  useEffect(() => {
    if (!user) {
      return;
    }
    (async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          await UsersApi.registerDeviceToken(token);
          deviceTokenRef.current = token;
        }
      } catch (error) {
        console.error("[push] failed to register device token:", error);
      }
    })();
  }, [user]);

  async function login(username: string, password: string): Promise<void> {
    const result = await AuthApi.login(username, password);
    await SecureTokenStorage.saveTokens(result.accessToken, result.refreshToken);
    setUser(result.user);
  }

  async function logout(): Promise<void> {
    if (deviceTokenRef.current) {
      try {
        await UsersApi.removeDeviceToken(deviceTokenRef.current);
      } catch {
        // Even if this fails, we still clear the local session below.
      }
      deviceTokenRef.current = null;
    }

    const refreshToken = await SecureTokenStorage.getRefreshToken();
    if (refreshToken) {
      try {
        await AuthApi.logout(refreshToken);
      } catch {
        // Even if the network call fails, we still clear the local session.
      }
    }
    await SecureTokenStorage.clearTokens();
    setUser(null);
  }

  function updateUser(patch: Partial<AuthUser>): void {
    setUser((current) => (current ? { ...current, ...patch } : current));
  }

  const value = useMemo(
    () => ({ user, isLoading, login, logout, updateUser }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
