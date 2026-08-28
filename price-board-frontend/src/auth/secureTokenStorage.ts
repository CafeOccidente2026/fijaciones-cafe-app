import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "priceboard_access_token";
const REFRESH_TOKEN_KEY = "priceboard_refresh_token";

/**
 * Single responsibility: read/write auth tokens from the device's secure
 * storage (Keychain on iOS, Keystore-backed storage on Android). Nothing
 * else in the app should touch SecureStore directly.
 */
export class SecureTokenStorage {
  static async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  }

  static async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  }

  static async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  }

  static async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  }
}
