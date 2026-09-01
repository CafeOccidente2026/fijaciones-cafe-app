import { httpClient } from "./httpClient";
import {
  CreatePriceFixingPayload,
  DetailedPriceFixing,
  HistoryFilters,
  MonthlyChartItem,
  MyPriceFixing,
  TodaySummaryItem,
  WeeklyByUserItem,
  WeeklyChartData,
  WeeklyHistoryWeek,
  WeeklyUserFixing,
} from "../types/priceFixing.types";

/**
 * Single responsibility: talk to /api/price-fixings.
 */
export class PriceFixingsApi {
  static async create(payload: CreatePriceFixingPayload): Promise<MyPriceFixing> {
    const { data } = await httpClient.post("/price-fixings", payload);
    return data.data as MyPriceFixing;
  }

  static async myHistory(): Promise<MyPriceFixing[]> {
    const { data } = await httpClient.get("/price-fixings/my-history");
    return data.data as MyPriceFixing[];
  }

  static async todaySummary(): Promise<TodaySummaryItem[]> {
    const { data } = await httpClient.get("/price-fixings/today-summary");
    return data.data as TodaySummaryItem[];
  }

  static async todayByType(coffeeTypeId: string): Promise<DetailedPriceFixing[]> {
    const { data } = await httpClient.get(`/price-fixings/today-by-type/${coffeeTypeId}`);
    return data.data as DetailedPriceFixing[];
  }

  static async history(filters: HistoryFilters = {}): Promise<DetailedPriceFixing[]> {
    const params: Record<string, string> = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) params[key] = value;
    }
    const { data } = await httpClient.get("/price-fixings/history", { params });
    return data.data as DetailedPriceFixing[];
  }

  static async monthlyChartData(): Promise<MonthlyChartItem[]> {
    const { data } = await httpClient.get("/price-fixings/monthly-chart-data");
    return data.data as MonthlyChartItem[];
  }

  static async weeklyChart(weekStart?: string): Promise<WeeklyChartData> {
    const { data } = await httpClient.get("/price-fixings/weekly-chart", {
      params: weekStart ? { weekStart } : undefined,
    });
    return data.data as WeeklyChartData;
  }

  static async weeklyHistory(): Promise<WeeklyHistoryWeek[]> {
    const { data } = await httpClient.get("/price-fixings/weekly-history");
    return data.data as WeeklyHistoryWeek[];
  }

  static async weeklyByUser(coffeeTypeId: string, weekStart?: string): Promise<WeeklyByUserItem[]> {
    const { data } = await httpClient.get(`/price-fixings/weekly-chart/${coffeeTypeId}/by-user`, {
      params: weekStart ? { weekStart } : undefined,
    });
    return data.data as WeeklyByUserItem[];
  }

  static async weeklyByUserFixings(
    coffeeTypeId: string,
    userId: string,
    weekStart?: string
  ): Promise<WeeklyUserFixing[]> {
    const { data } = await httpClient.get(
      `/price-fixings/weekly-chart/${coffeeTypeId}/by-user/${userId}`,
      { params: weekStart ? { weekStart } : undefined }
    );
    return data.data as WeeklyUserFixing[];
  }

  /** Raw PDF bytes for the weekly report - saving/sharing is the caller's job. */
  static async weeklyReportPdf(weekStart?: string): Promise<ArrayBuffer> {
    const { data } = await httpClient.get("/price-fixings/weekly-report-pdf", {
      params: weekStart ? { weekStart } : undefined,
      responseType: "arraybuffer",
    });
    return data as ArrayBuffer;
  }
}
