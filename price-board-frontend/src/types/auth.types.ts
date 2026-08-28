export type UserRole = "ADMIN" | "PRICE_MANAGER" | "PRODUCER";

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  municipality: string | null;
  profilePhotoUrl: string | null;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}
