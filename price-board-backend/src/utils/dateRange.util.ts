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
