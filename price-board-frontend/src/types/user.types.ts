import { UserRole } from "./auth.types";

export type UserStatus = "ACTIVE" | "SUSPENDED";

export interface AppUser {
  id: string;
  username: string;
  fullName: string;
  municipality: string | null;
  role: UserRole;
  status: UserStatus;
  profilePhotoUrl: string | null;
  createdAt: string;
}

export interface CreateUserPayload {
  username: string;
  password: string;
  fullName: string;
  municipality?: string;
  role: UserRole;
}
