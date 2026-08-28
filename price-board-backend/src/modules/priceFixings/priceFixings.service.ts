import { Prisma } from "@prisma/client";
import { PriceFixingsRepository } from "./priceFixings.repository";
import { CoffeeTypesRepository } from "../coffeeTypes/coffeeTypes.repository";
import { AppError } from "../../utils/apiResponse.util";
import { HistoryQuery } from "./priceFixings.validation";

type FixingWithCoffeeType = Prisma.PriceFixingGetPayload<{
  include: { coffeeType: { select: { id: true; name: true } } };
}>;

type FixingWithUser = Prisma.PriceFixingGetPayload<{
  include: {
    coffeeType: { select: { id: true; name: true } };
    user: { select: { id: true; fullName: true; municipality: true } };
  };
}>;

function serializeOwn(fixing: FixingWithCoffeeType) {
  return {
    id: fixing.id,
    coffeeType: fixing.coffeeType,
    kilos: Number(fixing.kilos),
    priceAtFixing: Number(fixing.priceAtFixing),
    createdAt: fixing.createdAt,
  };
}

function serializeDetailed(fixing: FixingWithUser) {
  return {
    id: fixing.id,
    coffeeType: fixing.coffeeType,
    user: {
      id: fixing.user.id,
      fullName: fixing.user.fullName,
      municipality: fixing.user.municipality,
    },
    kilos: Number(fixing.kilos),
    priceAtFixing: Number(fixing.priceAtFixing),
    createdAt: fixing.createdAt,
  };
}

/**
 * Single responsibility: business rules for price fixings. The price a
 * fixing is recorded at is always taken from the server's current
 * CoffeeType price, never from the client.
 */
export class PriceFixingsService {
  static async createFixing(userId: string, coffeeTypeId: string, kilos: number) {
    const coffeeType = await CoffeeTypesRepository.findById(coffeeTypeId);
    if (!coffeeType) {
      throw new AppError("Tipo de cafe no encontrado", 404);
    }
    if (!coffeeType.active) {
      throw new AppError("Ese tipo de cafe no esta disponible para fijar", 400);
    }

    const created = await PriceFixingsRepository.create({
      userId,
      coffeeTypeId,
      kilos,
      priceAtFixing: Number(coffeeType.currentPrice),
    });

    return serializeOwn(created);
  }

  static async getMyHistory(userId: string) {
    const rows = await PriceFixingsRepository.findByUser(userId);
    return rows.map(serializeOwn);
  }

  static getTodaySummary() {
    return PriceFixingsRepository.groupTodayByType();
  }

  static async getTodayByType(coffeeTypeId: string) {
    const rows = await PriceFixingsRepository.findTodayByType(coffeeTypeId);
    return rows.map(serializeDetailed);
  }

  static async getHistory(filters: HistoryQuery) {
    const rows = await PriceFixingsRepository.findHistory(filters);
    return rows.map(serializeDetailed);
  }

  static getMonthlyChartData() {
    return PriceFixingsRepository.sumLast30DaysByType();
  }
}
