import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "El usuario es requerido"),
  password: z.string().min(1, "La contrasena es requerida"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "El refresh token es requerido"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "La contrasena actual es requerida"),
  newPassword: z.string().min(8, "La nueva contrasena debe tener al menos 8 caracteres"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
