import { CoffeeType, Prisma, Role } from "@prisma/client";
import { CoffeeTypesRepository } from "./coffeeTypes.repository";
import { UsersRepository } from "../users/users.repository";
import { PushNotificationService } from "../../services/pushNotification.service";
import { AppError } from "../../utils/apiResponse.util";
import { CreateCoffeeTypeInput, PriceHistoryQuery } from "./coffeeTypes.validation";

/** Prisma returns Decimal objects; the API always sends plain numbers. */
function serialize(coffeeType: CoffeeType) {
  return {
    id: coffeeType.id,
    name: coffeeType.name,
    active: coffeeType.active,
    currentPrice: Number(coffeeType.currentPrice),
    createdAt: coffeeType.createdAt,
    updatedAt: coffeeType.updatedAt,
  };
}

type PriceHistoryRow = Prisma.PriceHistoryGetPayload<{
  include: {
    coffeeType: { select: { id: true; name: true } };
    changedBy: { select: { id: true; fullName: true; role: true } };
  };
}>;

function serializePriceHistory(row: PriceHistoryRow) {
  return {
    id: row.id,
    coffeeType: row.coffeeType,
    price: Number(row.price),
    changedBy: row.changedBy,
    changedAt: row.changedAt,
  };
}

/**
 * Every producer plus every price manager, except when the actor making
 * the change is itself a price manager - in that case they don't get a
 * push about their own change.
 */
async function getPriceAudienceIds(actorId: string, actorRole: Role): Promise<string[]> {
  const producerIds = await UsersRepository.findActiveIdsByRole(Role.PRODUCER);
  const managerIds = await UsersRepository.findActiveIdsByRole(Role.PRICE_MANAGER);
  const audienceManagerIds =
    actorRole === Role.PRICE_MANAGER ? managerIds.filter((id) => id !== actorId) : managerIds;
  return [...producerIds, ...audienceManagerIds];
}

/**
 * Single responsibility: business rules for coffee types and their price.
 * PRODUCER only ever sees active types; ADMIN can opt into inactive ones.
 */
export class CoffeeTypesService {
  static async list(role: Role, includeInactive: boolean) {
    const canSeeInactive = role === Role.ADMIN && includeInactive;
    const rows = await CoffeeTypesRepository.findMany(canSeeInactive);
    return rows.map(serialize);
  }

  static async getById(id: string) {
    const coffeeType = await CoffeeTypesRepository.findById(id);
    if (!coffeeType) {
      throw new AppError("Tipo de cafe no encontrado", 404);
    }
    return coffeeType;
  }

  static async create(input: CreateCoffeeTypeInput, actorId: string, actorRole: Role) {
    const existing = await CoffeeTypesRepository.findByName(input.name);
    if (existing) {
      throw new AppError("Ya existe un tipo de cafe con ese nombre", 409);
    }

    const created = await CoffeeTypesRepository.create({
      name: input.name,
      currentPrice: input.currentPrice,
    });
    const serialized = serialize(created);

    try {
      const audienceIds = await getPriceAudienceIds(actorId, actorRole);
      await PushNotificationService.sendPushToUsers(
        audienceIds,
        "Nuevo tipo de cafe",
        `Se agrego ${serialized.name} al listado de precios`
      );
    } catch (error) {
      console.error("[coffeeTypes] push failed:", error);
    }

    return serialized;
  }

  /**
   * Activate/deactivate. Deactivating is the way to "remove" a type
   * without breaking the price fixings that already reference it - a hard
   * delete is never exposed, so history stays intact.
   */
  static async setActive(id: string, active: boolean) {
    await this.getById(id);
    const updated = await CoffeeTypesRepository.setActive(id, active);
    return serialize(updated);
  }

  static async changePrice(id: string, price: number, changedById: string, actorRole: Role) {
    await this.getById(id);
    const updated = await CoffeeTypesRepository.changePrice(id, price, changedById);
    const serialized = serialize(updated);

    try {
      const audienceIds = await getPriceAudienceIds(changedById, actorRole);
      await PushNotificationService.sendPushToUsers(
        audienceIds,
        "Precio actualizado",
        `${serialized.name} ahora vale $${serialized.currentPrice} por kilogramo`
      );
    } catch (error) {
      console.error("[coffeeTypes] push failed:", error);
    }

    return serialized;
  }

  static async getPriceHistory(filters: PriceHistoryQuery) {
    const rows = await CoffeeTypesRepository.findPriceHistory(filters);
    return rows.map(serializePriceHistory);
  }
}
