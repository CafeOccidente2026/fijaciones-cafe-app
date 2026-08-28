import { Request, Response } from "express";
import { UsersService } from "./users.service";
import { createUserSchema, listUsersQuerySchema, updateProfilePhotoSchema } from "./users.validation";
import { ApiResponse, AppError } from "../../utils/apiResponse.util";

/**
 * Single responsibility: translate HTTP <-> UsersService calls.
 * No business logic here.
 */
export class UsersController {
  static async create(req: Request, res: Response): Promise<void> {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? "Datos invalidos", 422);
    }

    const user = await UsersService.createUser(parsed.data);
    ApiResponse.success(res, user, 201);
  }

  static async list(req: Request, res: Response): Promise<void> {
    const parsed = listUsersQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? "Filtros invalidos", 422);
    }

    const users = await UsersService.listUsers(parsed.data.role);
    ApiResponse.success(res, users);
  }

  static async me(req: Request, res: Response): Promise<void> {
    const user = await UsersService.getById(req.auth!.userId);
    ApiResponse.success(res, user);
  }

  static async updateMyProfilePhoto(req: Request, res: Response): Promise<void> {
    const parsed = updateProfilePhotoSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? "Datos invalidos", 422);
    }

    const user = await UsersService.updateMyProfilePhoto(req.auth!.userId, parsed.data.profilePhotoUrl);
    ApiResponse.success(res, user);
  }

  static async suspend(req: Request, res: Response): Promise<void> {
    const user = await UsersService.suspendUser(req.params.id);
    ApiResponse.success(res, user);
  }

  static async activate(req: Request, res: Response): Promise<void> {
    const user = await UsersService.activateUser(req.params.id);
    ApiResponse.success(res, user);
  }

  static async remove(req: Request, res: Response): Promise<void> {
    await UsersService.deleteUser(req.params.id);
    ApiResponse.success(res, { message: "Usuario eliminado" });
  }
}
