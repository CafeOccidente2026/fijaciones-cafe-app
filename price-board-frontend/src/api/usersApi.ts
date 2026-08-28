import { httpClient } from "./httpClient";
import { AppUser, CreateUserPayload } from "../types/user.types";
import { UserRole } from "../types/auth.types";

/**
 * Single responsibility: talk to /api/users. Returns plain data; the
 * token is attached by httpClient.
 */
export class UsersApi {
  static async list(role?: UserRole): Promise<AppUser[]> {
    const { data } = await httpClient.get("/users", { params: role ? { role } : undefined });
    return data.data as AppUser[];
  }

  static async create(payload: CreateUserPayload): Promise<AppUser> {
    const { data } = await httpClient.post("/users", payload);
    return data.data as AppUser;
  }

  static async suspend(id: string): Promise<AppUser> {
    const { data } = await httpClient.patch(`/users/${id}/suspend`);
    return data.data as AppUser;
  }

  static async activate(id: string): Promise<AppUser> {
    const { data } = await httpClient.patch(`/users/${id}/activate`);
    return data.data as AppUser;
  }

  static async remove(id: string): Promise<void> {
    await httpClient.delete(`/users/${id}`);
  }

  static async getMe(): Promise<AppUser> {
    const { data } = await httpClient.get("/users/me");
    return data.data as AppUser;
  }

  static async updateProfilePhoto(profilePhotoUrl: string): Promise<AppUser> {
    const { data } = await httpClient.patch("/users/me/profile-photo", { profilePhotoUrl });
    return data.data as AppUser;
  }
}
