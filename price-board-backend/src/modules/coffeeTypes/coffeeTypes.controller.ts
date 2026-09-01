import { Request, Response } from "express";
import { CoffeeTypesService } from "./coffeeTypes.service";
import {
  createCoffeeTypeSchema,
  listCoffeeTypesQuerySchema,
  priceHistoryQuerySchema,
  updateCoffeeTypeSchema,
  updatePriceSchema,
} from "./coffeeTypes.validation";
import { ApiResponse, AppError } from "../../utils/apiResponse.util";

/**
 * Single responsibility: translate HTTP <-> CoffeeTypesService calls.
 */
export class CoffeeTypesController {
  static async list(req: Request, res: Response): Promise<void> {
    const parsed = listCoffeeTypesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? "Filtros invalidos", 422);
    }

    const coffeeTypes = await CoffeeTypesService.list(req.auth!.role, parsed.data.includeInactive);
    ApiResponse.success(res, coffeeTypes);
  }

  static async create(req: Request, res: Response): Promise<void> {
    const parsed = createCoffeeTypeSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? "Datos invalidos", 422);
    }

    const coffeeType = await CoffeeTypesService.create(parsed.data, req.auth!.userId, req.auth!.role);
    ApiResponse.success(res, coffeeType, 201);
  }

  static async update(req: Request, res: Response): Promise<void> {
    const parsed = updateCoffeeTypeSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? "Datos invalidos", 422);
    }

    const coffeeType = await CoffeeTypesService.setActive(req.params.id, parsed.data.active);
    ApiResponse.success(res, coffeeType);
  }

  static async changePrice(req: Request, res: Response): Promise<void> {
    const parsed = updatePriceSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? "Datos invalidos", 422);
    }

    const coffeeType = await CoffeeTypesService.changePrice(
      req.params.id,
      parsed.data.price,
      req.auth!.userId,
      req.auth!.role
    );
    ApiResponse.success(res, coffeeType);
  }

  static async priceHistory(req: Request, res: Response): Promise<void> {
    const parsed = priceHistoryQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? "Filtros invalidos", 422);
    }

    const history = await CoffeeTypesService.getPriceHistory(parsed.data);
    ApiResponse.success(res, history);
  }
}
