import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { SecureTokenStorage } from "../auth/secureTokenStorage";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000/api";

// TEMP DEBUG: confirma que Expo inyecto la variable de entorno. Recuerda
// que EXPO_PUBLIC_* se resuelve en build time: si cambiaste el .env hay
// que reiniciar con `npx expo start -c`. Quitar esta linea al terminar.
console.log("[DEBUG] API_URL =", API_URL);

export const httpClient = axios.create({ baseURL: API_URL });

/**
 * Called by AuthContext once, at startup, so this file doesn't need to
 * import AuthContext directly (that would create a circular dependency).
 */
let onSessionExpired: (() => void) | null = null;
export function registerSessionExpiredHandler(handler: () => void): void {
  onSessionExpired = handler;
}

// Attach the current access token to every outgoing request.
httpClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const accessToken = await SecureTokenStorage.getAccessToken();
  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return config;
});

let isRefreshing = false;
let pendingRequests: Array<() => void> = [];

// On a 401, try to refresh the token once and retry the original request.
// If refresh fails too, the session is considered expired.
httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      // Another request already triggered the refresh; wait for it.
      await new Promise<void>((resolve) => pendingRequests.push(resolve));
      return httpClient(originalRequest);
    }

    isRefreshing = true;

    try {
      const refreshToken = await SecureTokenStorage.getRefreshToken();
      if (!refreshToken) throw new Error("No refresh token available");

      const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
      await SecureTokenStorage.saveTokens(data.data.accessToken, data.data.refreshToken);

      pendingRequests.forEach((resolve) => resolve());
      pendingRequests = [];

      return httpClient(originalRequest);
    } catch (refreshError) {
      pendingRequests = [];
      await SecureTokenStorage.clearTokens();
      onSessionExpired?.();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
