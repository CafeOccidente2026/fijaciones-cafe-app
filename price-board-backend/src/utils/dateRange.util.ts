/**
 * Single responsibility: build Date ranges from the server's current
 * local time. Used by the "del dia" and "ultimo mes" price-fixing
 * endpoints so the cutoff is always computed on the fly, no cron needed.
 */

/** [00:00:00.000 today, 00:00:00.000 tomorrow) in the server's local time. */
export function getTodayRange(): { start: Date; end: Date } {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

/** [now - <days>, now]. Defaults to the last 30 days. */
export function getLastDaysRange(days = 30): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - days);

  return { start, end };
}

/** Monday 00:00:00.000 (server local time) of the week containing `date`. */
export function getWeekStart(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay(); // 0 = Sunday ... 6 = Saturday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diffToMonday);
  return start;
}

/** [Monday 00:00:00.000, Friday 23:59:59.999] of the week containing `date`. Defaults to now. */
export function getWeekRange(date: Date = new Date()): { start: Date; end: Date } {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 4);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

/** Date -> "YYYY-MM-DD" in the server's local time (avoids the UTC shift of toISOString). */
export function formatDateOnly(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
