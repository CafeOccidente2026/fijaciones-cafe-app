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

  /**
   * Uploads a real image file (from the camera or gallery). On React
   * Native we set "multipart/form-data" without a boundary on purpose:
   * the RN network layer fills in the boundary. We never send JSON here.
   */
  static async uploadProfilePhoto(file: {
    uri: string;
    name: string;
    type: string;
  }): Promise<AppUser> {
    const formData = new FormData();
    // React Native's FormData accepts this {uri,name,type} shape for files.
    formData.append("photo", file as unknown as Blob);

    const { data } = await httpClient.post("/users/me/profile-photo-upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data as AppUser;
  }

  static async registerDeviceToken(token: string): Promise<void> {
    await httpClient.post("/users/me/device-token", { token });
  }

  static async removeDeviceToken(token: string): Promise<void> {
    await httpClient.delete("/users/me/device-token", { data: { token } });
  }
}
