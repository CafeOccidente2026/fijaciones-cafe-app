import path from "path";
import PDFDocument from "pdfkit";
import { PriceFixingsService } from "../modules/priceFixings/priceFixings.service";

// Same relative path from src/services (dev) and dist/services (build).
const FONTS_DIR = path.join(__dirname, "../../assets/fonts");
const REGULAR = "Tinos";
const BOLD = "Tinos-Bold";

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

    doc.registerFont(REGULAR, path.join(FONTS_DIR, "Tinos-Regular.ttf"));
    doc.registerFont(BOLD, path.join(FONTS_DIR, "Tinos-Bold.ttf"));

    // Font size plus a 1.5 line spacing (lineGap = half a single line).
    const setSize = (size: number) => doc.fontSize(size).lineGap(doc.currentLineHeight(true) * 0.5);

    setSize(18);
    doc.font(BOLD).text("Reporte semanal de fijaciones", { align: "center" });
    doc.moveDown(0.3);
    setSize(12);
    doc
      .font(REGULAR)
      .fillColor("#555555")
      .text(`Semana del ${chart.weekStart} al ${chart.weekEnd}`, { align: "center" });
    doc.moveDown(1.2);

    const totalKilos = chart.items.reduce((sum, item) => sum + item.totalKilos, 0);
    const totalFixings = chart.items.reduce((sum, item) => sum + item.fixingsCount, 0);
    doc.fillColor("#000000");
    doc.font(BOLD).text("Total de kilos fijados: ", { continued: true }).font(REGULAR).text(`${totalKilos} kg`);
    doc.font(BOLD).text("Total de fijaciones: ", { continued: true }).font(REGULAR).text(`${totalFixings}`);
    doc.moveDown(1);

    for (const item of chart.items) {
      setSize(14);
      doc.font(BOLD).text(item.coffeeTypeName, { underline: true });
      setSize(12);
      doc.font(REGULAR).text(`${item.totalKilos} kg - ${item.fixingsCount} fijaciones`);
      doc.moveDown(0.3);

      const byUser = await PriceFixingsService.getWeeklyByUser(item.coffeeTypeId, weekStart);
      for (const user of byUser) {
        doc
          .font(REGULAR)
          .text("  - ", { continued: true })
          .font(BOLD)
          .text(user.fullName, { continued: true })
          .font(REGULAR)
          .text(`: ${user.totalKilos} kg`);
      }
      doc.moveDown(0.8);
    }

    doc.end();
    const buffer = await finished;
    return { weekStart: chart.weekStart, weekEnd: chart.weekEnd, buffer };
  }
}
