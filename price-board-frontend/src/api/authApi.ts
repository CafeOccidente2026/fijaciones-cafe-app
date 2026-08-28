import { httpClient } from "./httpClient";
import { LoginResponse } from "../types/auth.types";

/**
 * Single responsibility: talk to /api/auth/*. Returns plain data,
 * doesn't touch storage or navigation - that's AuthContext's job.
 */
export class AuthApi {
  static async login(username: string, password: string): Promise<LoginResponse> {
    const { data } = await httpClient.post("/auth/login", { username, password });
    return data.data as LoginResponse;
  }

  static async logout(refreshToken: string): Promise<void> {
    await httpClient.post("/auth/logout", { refreshToken });
  }
}
