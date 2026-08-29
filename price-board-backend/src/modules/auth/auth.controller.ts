import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { loginSchema, refreshSchema, changePasswordSchema } from "./auth.validation";
import { ApiResponse, AppError } from "../../utils/apiResponse.util";

/**
 * Single responsibility: translate HTTP requests/responses into calls
 * to AuthService. No business logic lives here.
 */
export class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? "Datos invalidos", 422);
    }

    const result = await AuthService.login(parsed.data.username, parsed.data.password);
    ApiResponse.success(res, result);
  }

  static async refresh(req: Request, res: Response): Promise<void> {
    const parsed = refreshSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? "Datos invalidos", 422);
    }

    const result = await AuthService.refresh(parsed.data.refreshToken);
    ApiResponse.success(res, result);
  }

  static async logout(req: Request, res: Response): Promise<void> {
    const parsed = refreshSchema.safeParse(req.body);

    if (parsed.success) {
      await AuthService.logout(parsed.data.refreshToken);
    }

    ApiResponse.success(res, { message: "Sesion cerrada" });
  }

  static async changePassword(req: Request, res: Response): Promise<void> {
    const parsed = changePasswordSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? "Datos invalidos", 422);
    }

    const result = await AuthService.changePassword(
      req.auth!.userId,
      parsed.data.currentPassword,
      parsed.data.newPassword
    );
    ApiResponse.success(res, result);
  }
}
