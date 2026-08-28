import { httpClient } from "./httpClient";
import { CoffeeType } from "../types/coffeeType.types";

/**
 * Single responsibility: talk to /api/coffee-types.
 */
export class CoffeeTypesApi {
  static async list(includeInactive = false): Promise<CoffeeType[]> {
    const { data } = await httpClient.get("/coffee-types", {
      params: includeInactive ? { includeInactive: "true" } : undefined,
    });
    return data.data as CoffeeType[];
  }

  static async create(payload: { name: string; currentPrice?: number }): Promise<CoffeeType> {
    const { data } = await httpClient.post("/coffee-types", payload);
    return data.data as CoffeeType;
  }

  static async setActive(id: string, active: boolean): Promise<CoffeeType> {
    const { data } = await httpClient.patch(`/coffee-types/${id}`, { active });
    return data.data as CoffeeType;
  }

  static async updatePrice(id: string, price: number): Promise<CoffeeType> {
    const { data } = await httpClient.patch(`/coffee-types/${id}/price`, { price });
    return data.data as CoffeeType;
  }
}
