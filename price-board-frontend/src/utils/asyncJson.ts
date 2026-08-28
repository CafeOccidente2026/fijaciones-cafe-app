import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Single responsibility: read/write JSON blobs in AsyncStorage without
 * every caller repeating the parse/stringify + try/catch.
 */
export async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Non-critical local cache; ignore write failures.
  }
}
