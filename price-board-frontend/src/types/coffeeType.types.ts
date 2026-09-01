export interface CoffeeType {
  id: string;
  name: string;
  active: boolean;
  currentPrice: number;
  createdAt: string;
  updatedAt: string;
}

/** One row of GET /coffee-types/price-history. */
export interface PriceHistoryEntry {
  id: string;
  coffeeType: { id: string; name: string };
  price: number;
  changedBy: { id: string; fullName: string; role: string };
  changedAt: string;
}
