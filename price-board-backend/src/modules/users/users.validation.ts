import { z } from "zod";
import { Role } from "@prisma/client";

export const createUserSchema = z.object({
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres"),
  fullName: z.string().min(1, "El nombre completo es requerido"),
  municipality: z.string().min(1).optional(),
  role: z.nativeEnum(Role, { errorMap: () => ({ message: "Rol invalido" }) }),
});

export const updateProfilePhotoSchema = z.object({
  profilePhotoUrl: z.string().url("La foto de perfil debe ser una URL valida"),
});

export const listUsersQuerySchema = z.object({
  role: z.nativeEnum(Role).optional(),
});

export const registerDeviceTokenSchema = z.object({
  token: z.string().min(1, "El token es requerido"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateProfilePhotoInput = z.infer<typeof updateProfilePhotoSchema>;
export type RegisterDeviceTokenInput = z.infer<typeof registerDeviceTokenSchema>;
