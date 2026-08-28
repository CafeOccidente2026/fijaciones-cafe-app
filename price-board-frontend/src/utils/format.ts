/**
 * Single responsibility: turn raw API values into the strings shown in
 * the UI. All user-facing text is in Spanish.
 */

/** e.g. 12500 -> "$ 12.500" (dot as thousands separator, no decimals). */
export function formatCurrency(value: number): string {
  const rounded = Math.round(value);
  const grouped = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `$ ${grouped}`;
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

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  PRICE_MANAGER: "Encargado de precios",
  PRODUCER: "Productor",
};

export function roleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role;
}
