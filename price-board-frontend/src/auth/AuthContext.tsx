import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AuthApi } from "../api/authApi";
import { SecureTokenStorage } from "./secureTokenStorage";
import { registerSessionExpiredHandler } from "../api/httpClient";
import { AuthUser } from "../types/auth.types";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  async function login(username: string, password: string): Promise<void> {
    const result = await AuthApi.login(username, password);
    await SecureTokenStorage.saveTokens(result.accessToken, result.refreshToken);
    setUser(result.user);
  }

  async function logout(): Promise<void> {
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

  const value = useMemo(() => ({ user, isLoading, login, logout }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
