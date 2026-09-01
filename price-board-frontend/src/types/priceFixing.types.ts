export interface CoffeeTypeRef {
  id: string;
  name: string;
}

/** A producer's own fixing (GET /price-fixings/my-history). */
export interface MyPriceFixing {
  id: string;
  coffeeType: CoffeeTypeRef;
  kilos: number;
  priceAtFixing: number;
  createdAt: string;
}

/** One row of GET /price-fixings/today-summary. */
export interface TodaySummaryItem {
  id: string;
  name: string;
  count: number;
}

/** A detailed fixing with its producer (today-by-type and history). */
export interface DetailedPriceFixing {
  id: string;
  coffeeType: CoffeeTypeRef;
  user: {
    id: string;
    fullName: string;
    municipality: string | null;
  };
  kilos: number;
  priceAtFixing: number;
  createdAt: string;
}

export interface HistoryFilters {
  coffeeTypeId?: string;
  userId?: string;
  municipality?: string;
  dateFrom?: string;
  dateTo?: string;
}

/** One row of GET /price-fixings/monthly-chart-data. */
export interface MonthlyChartItem {
  id: string;
  name: string;
  totalKilos: number;
  fixingsCount: number;
}

export interface CreatePriceFixingPayload {
  coffeeTypeId: string;
  kilos: number;
}

/** One bar of GET /price-fixings/weekly-chart. */
export interface WeeklyChartItem {
  coffeeTypeId: string;
  coffeeTypeName: string;
  totalKilos: number;
  fixingsCount: number;
}

/** GET /price-fixings/weekly-chart. */
export interface WeeklyChartData {
  weekStart: string;
  weekEnd: string;
  items: WeeklyChartItem[];
}

/** One row of GET /price-fixings/weekly-history. */
export interface WeeklyHistoryWeek {
  weekStart: string;
  weekEnd: string;
  totalKilos: number;
  fixingsCount: number;
}

/** One row of GET /price-fixings/weekly-chart/:coffeeTypeId/by-user. */
export interface WeeklyByUserItem {
  userId: string;
  fullName: string;
  municipality: string | null;
  totalKilos: number;
  fixingsCount: number;
}

/** One row of GET /price-fixings/weekly-chart/:coffeeTypeId/by-user/:userId. */
export interface WeeklyUserFixing {
  kilos: number;
  priceAtFixing: number;
  createdAt: string;
}
