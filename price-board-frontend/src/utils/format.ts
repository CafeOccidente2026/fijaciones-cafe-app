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
