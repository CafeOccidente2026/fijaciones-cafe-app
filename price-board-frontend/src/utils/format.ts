import { strings } from "../constants/strings";

/**
 * Single responsibility: turn raw API values into the strings shown in
 * the UI. All user-facing text is in Spanish.
 */

/** e.g. 12500 -> "$ 12.500" (dot as thousands separator, no decimals). */
export function formatCurrency(value: number): string {
  return `$ ${formatThousands(String(Math.round(value)))}`;
}

/**
 * Groups a raw digit string with dots as thousands separators, live as
 * the user types. "2500000" -> "2.500.000". Non-digits are dropped.
 */
export function formatThousands(rawDigits: string): string {
  const digits = rawDigits.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  if (digits === "") return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** Inverse of formatThousands. "2.500.000" -> 2500000. "" -> NaN. */
export function parseThousands(formatted: string): number {
  const digits = formatted.replace(/\D/g, "");
  return digits === "" ? NaN : Number(digits);
}

/** e.g. 27 -> "27 kg" */
export function formatKilos(value: number): string {
  const rounded = Number.isInteger(value) ? value.toString() : value.toFixed(2);
  return `${rounded} kg`;
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

/** ISO string -> "28/08/2026 - 08:06:24 am" (matches the spec's card format). */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();

  let hours = date.getHours();
  const period = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12;

  const time = `${pad(hours)}:${pad(date.getMinutes())}:${pad(date.getSeconds())} ${period}`;
  return `${day}/${month}/${year} - ${time}`;
}

/** ISO string -> "28/08/2026" */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function roleLabel(role: string): string {
  return strings.roles[role] ?? role;
}

/** "YYYY-MM-DD" -> local Date at midnight, no UTC-shift like `new Date(dateOnly)` has. */
function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** "YYYY-MM-DD" -> "28/08/2026" */
export function formatDateOnlyDisplay(value: string): string {
  const date = parseDateOnly(value);
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

const MONTH_NAMES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** ("2026-08-25", "2026-08-29") -> "25 al 29 de agosto" (or "30 de agosto al 3 de septiembre"). */
export function formatWeekRange(weekStart: string, weekEnd: string): string {
  const start = parseDateOnly(weekStart);
  const end = parseDateOnly(weekEnd);
  const endLabel = `${end.getDate()} de ${MONTH_NAMES[end.getMonth()]}`;

  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()} al ${endLabel}`;
  }
  return `${start.getDate()} de ${MONTH_NAMES[start.getMonth()]} al ${endLabel}`;
}

/** ISO string -> "8:06 AM" (no leading zero, no seconds - for the fixing drill-down list). */
export function formatTimeShort(iso: string): string {
  const date = new Date(iso);
  let hours = date.getHours();
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${pad(date.getMinutes())} ${period}`;
}
