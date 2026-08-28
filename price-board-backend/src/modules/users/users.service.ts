import { Prisma, Role, UserStatus } from "@prisma/client";
import { UsersRepository } from "./users.repository";
import { AuthRepository } from "../auth/auth.repository";
import { PasswordUtil } from "../../utils/password.util";
import { AppError } from "../../utils/apiResponse.util";
import { CreateUserInput } from "./users.validation";

/**
 * Single responsibility: business rules around user accounts (creation,
 * suspension, deletion, self lookup). Knows nothing about HTTP.
 */
export class UsersService {
  static async createUser(input: CreateUserInput) {
    const existing = await UsersRepository.findByUsername(input.username);
    if (existing) {
      throw new AppError("Ya existe un usuario con ese nombre de usuario", 409);
    }

    const passwordHash = await PasswordUtil.hash(input.password);

    return UsersRepository.create({
      username: input.username,
      passwordHash,
      fullName: input.fullName,
      municipality: input.municipality,
      role: input.role,
    });
  }

  static listUsers(role?: Role) {
    return UsersRepository.findAll(role);
  }

  static async getById(id: string) {
    const user = await UsersRepository.findById(id);
    if (!user) {
      throw new AppError("Usuario no encontrado", 404);
    }
    return user;
  }

  /**
   * Suspends the account and immediately revokes every active refresh
   * token, so an already-open session can't keep refreshing its access
   * token past its ~15 min lifetime.
   */
  static async suspendUser(id: string) {
    await this.getById(id);
    const user = await UsersRepository.updateStatus(id, UserStatus.SUSPENDED);
    await AuthRepository.revokeAllTokensForUser(id);
    return user;
  }

  static async activateUser(id: string) {
    await this.getById(id);
    return UsersRepository.updateStatus(id, UserStatus.ACTIVE);
  }

  static async deleteUser(id: string) {
    try {
      await UsersRepository.deleteById(id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new AppError("Usuario no encontrado", 404);
        }
        if (error.code === "P2003") {
          throw new AppError(
            "No se puede eliminar: el usuario tiene fijaciones, cambios de precio o notificaciones asociadas. Suspendelo en su lugar.",
            409
          );
        }
      }
      throw error;
    }
  }

  static updateMyProfilePhoto(userId: string, profilePhotoUrl: string) {
    return UsersRepository.updateProfilePhoto(userId, profilePhotoUrl);
  }
}
