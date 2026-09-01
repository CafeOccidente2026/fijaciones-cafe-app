import PDFDocument from "pdfkit";
import { PriceFixingsService } from "../modules/priceFixings/priceFixings.service";

/**
 * Single responsibility: render the weekly fixings report as a PDF
 * buffer. Pulls its numbers from PriceFixingsService's own aggregation
 * methods (parts 1.1-1.4) instead of querying Prisma directly.
 */
export class WeeklyReportPdfService {
  static async build(weekStart?: string): Promise<{ weekStart: string; weekEnd: string; buffer: Buffer }> {
    const chart = await PriceFixingsService.getWeeklyChart(weekStart);

    const doc = new PDFDocument({ margin: 40 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    const finished = new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });

    doc.fontSize(18).text("Reporte semanal de fijaciones", { align: "center" });
    doc.moveDown(0.3);
    doc
      .fontSize(11)
      .fillColor("#555555")
      .text(`Semana del ${chart.weekStart} al ${chart.weekEnd}`, { align: "center" });
    doc.moveDown(1.2);

    const totalKilos = chart.items.reduce((sum, item) => sum + item.totalKilos, 0);
    const totalFixings = chart.items.reduce((sum, item) => sum + item.fixingsCount, 0);
    doc.fillColor("#000000").fontSize(12).text(`Total de kilos fijados: ${totalKilos} kg`);
    doc.text(`Total de fijaciones: ${totalFixings}`);
    doc.moveDown(1);

    for (const item of chart.items) {
      doc.fontSize(14).text(item.coffeeTypeName, { underline: true });
      doc.fontSize(11).text(`${item.totalKilos} kg - ${item.fixingsCount} fijaciones`);
      doc.moveDown(0.3);

      const byUser = await PriceFixingsService.getWeeklyByUser(item.coffeeTypeId, weekStart);
      for (const user of byUser) {
        doc.fontSize(10).text(`  - ${user.fullName}: ${user.totalKilos} kg`);
      }
      doc.moveDown(0.8);
    }

    doc.end();
    const buffer = await finished;
    return { weekStart: chart.weekStart, weekEnd: chart.weekEnd, buffer };
  }
}
