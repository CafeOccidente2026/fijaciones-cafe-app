import { Request, Response } from "express";
import { PriceFixingsService } from "./priceFixings.service";
import { WeeklyReportPdfService } from "../../services/weeklyReportPdf.service";
import { createPriceFixingSchema, historyQuerySchema, weekQuerySchema } from "./priceFixings.validation";
import { ApiResponse, AppError } from "../../utils/apiResponse.util";

/**
 * Single responsibility: translate HTTP <-> PriceFixingsService calls.
 */
export class PriceFixingsController {
  static async create(req: Request, res: Response): Promise<void> {
    const parsed = createPriceFixingSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? "Datos invalidos", 422);
    }

    const fixing = await PriceFixingsService.createFixing(
      req.auth!.userId,
      parsed.data.coffeeTypeId,
      parsed.data.kilos
    );
    ApiResponse.success(res, fixing, 201);
  }

  static async myHistory(req: Request, res: Response): Promise<void> {
    const history = await PriceFixingsService.getMyHistory(req.auth!.userId);
    ApiResponse.success(res, history);
  }

  static async todaySummary(_req: Request, res: Response): Promise<void> {
    const summary = await PriceFixingsService.getTodaySummary();
    ApiResponse.success(res, summary);
  }

  static async todayByType(req: Request, res: Response): Promise<void> {
    const fixings = await PriceFixingsService.getTodayByType(req.params.coffeeTypeId);
    ApiResponse.success(res, fixings);
  }

  static async history(req: Request, res: Response): Promise<void> {
    const parsed = historyQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? "Filtros invalidos", 422);
    }

    const history = await PriceFixingsService.getHistory(parsed.data);
    ApiResponse.success(res, history);
  }

  static async monthlyChartData(_req: Request, res: Response): Promise<void> {
    const data = await PriceFixingsService.getMonthlyChartData();
    ApiResponse.success(res, data);
  }

  static async weeklyChart(req: Request, res: Response): Promise<void> {
    const parsed = weekQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? "Filtros invalidos", 422);
    }

    const data = await PriceFixingsService.getWeeklyChart(parsed.data.weekStart);
    ApiResponse.success(res, data);
  }

  static async weeklyHistory(_req: Request, res: Response): Promise<void> {
    const data = await PriceFixingsService.getWeeklyHistory();
    ApiResponse.success(res, data);
  }

  static async weeklyByUser(req: Request, res: Response): Promise<void> {
    const parsed = weekQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? "Filtros invalidos", 422);
    }

    const data = await PriceFixingsService.getWeeklyByUser(req.params.coffeeTypeId, parsed.data.weekStart);
    ApiResponse.success(res, data);
  }

  static async weeklyByUserFixings(req: Request, res: Response): Promise<void> {
    const parsed = weekQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? "Filtros invalidos", 422);
    }

    const data = await PriceFixingsService.getWeeklyByUserFixings(
      req.params.coffeeTypeId,
      req.params.userId,
      parsed.data.weekStart
    );
    ApiResponse.success(res, data);
  }

  static async weeklyReportPdf(req: Request, res: Response): Promise<void> {
    const parsed = weekQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? "Filtros invalidos", 422);
    }

    const report = await WeeklyReportPdfService.build(parsed.data.weekStart);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="reporte-semanal-${report.weekStart}.pdf"`
    );
    res.send(report.buffer);
  }
}
