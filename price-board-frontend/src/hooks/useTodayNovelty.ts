import { useCallback, useEffect, useState } from "react";
import { readJson, writeJson } from "../utils/asyncJson";

interface TodaySeen {
  /** "YYYY-MM-DD" of the day these counts belong to. */
  date: string;
  /** coffeeTypeId -> how many of today's fixings this user had already reviewed. */
  counts: Record<string, number>;
}

const storageKey = (userId: string) => `priceboard_today_seen_${userId}`;

function todayKey(): string {
  const now = new Date();
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

interface TodayNovelty {
  /** New (unreviewed) fixings for a type = todayCount - lastSeenCount, min 0. */
  newCountFor: (coffeeTypeId: string, todayCount: number) => number;
  /** Mark a type reviewed at the given current count. */
  markSeen: (coffeeTypeId: string, currentCount: number) => void;
  /** Re-read from storage (call on screen focus). */
  refresh: () => Promise<void>;
}

/**
 * Single responsibility: per user and on-device, track how many of
 * today's fixings-per-coffee-type the PRICE_MANAGER has already reviewed,
 * so the "Fijaciones del día" badge shows only what's new. Resets when
 * the calendar day changes.
 */
export function useTodayNovelty(userId: string | undefined): TodayNovelty {
  const [seen, setSeen] = useState<TodaySeen>({ date: todayKey(), counts: {} });

  const refresh = useCallback(async () => {
    if (!userId) {
      setSeen({ date: todayKey(), counts: {} });
      return;
    }
    const stored = await readJson<TodaySeen>(storageKey(userId));
    if (stored && stored.date === todayKey()) {
      setSeen(stored);
    } else {
      const reset: TodaySeen = { date: todayKey(), counts: {} };
      setSeen(reset);
      await writeJson(storageKey(userId), reset);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const newCountFor = useCallback(
    (coffeeTypeId: string, todayCount: number) =>
      Math.max(0, todayCount - (seen.counts[coffeeTypeId] ?? 0)),
    [seen]
  );

  // Stable: uses the functional updater, so it never closes over `seen`.
  const markSeen = useCallback(
    (coffeeTypeId: string, currentCount: number) => {
      if (!userId) return;
      setSeen((prev) => {
        const base = prev.date === todayKey() ? prev : { date: todayKey(), counts: {} };
        if (base.counts[coffeeTypeId] === currentCount) return prev;
        const next: TodaySeen = {
          date: todayKey(),
          counts: { ...base.counts, [coffeeTypeId]: currentCount },
        };
        void writeJson(storageKey(userId), next);
        return next;
      });
    },
    [userId]
  );

  return { newCountFor, markSeen, refresh };
}
