import { useCallback, useEffect, useRef, useState } from "react";
import { readJson, writeJson } from "../utils/asyncJson";
import { CoffeeType } from "../types/coffeeType.types";

/** coffeeTypeId -> the `updatedAt` this user last saw for that type. */
type SeenMap = Record<string, string>;

const storageKey = (userId: string) => `priceboard_price_seen_${userId}`;

interface PriceNovelty {
  /** Coffee type ids with a price update this user hasn't seen yet. */
  novelIds: Set<string>;
  /** Call when the user opens/selects a type: clears its "novedad". */
  markSeen: (coffeeTypeId: string) => void;
}

/**
 * Single responsibility: track, per user and on-device, which coffee
 * types have had a price change (CoffeeType.updatedAt) that this user
 * has not looked at yet. The first time a user ever opens the screen,
 * everything is silently marked as seen - novedades only appear for
 * changes after that.
 */
export function usePriceNovelty(
  userId: string | undefined,
  coffeeTypes: CoffeeType[] | null
): PriceNovelty {
  const [seenMap, setSeenMap] = useState<SeenMap | null>(null);
  const [novelIds, setNovelIds] = useState<Set<string>>(new Set());
  const didFirstRun = useRef(false);

  useEffect(() => {
    if (!userId) {
      setSeenMap(null);
      return;
    }
    let active = true;
    readJson<SeenMap>(storageKey(userId)).then((stored) => {
      if (active) setSeenMap(stored ?? {});
    });
    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId || seenMap === null || !coffeeTypes) return;

    const isFirstEver = Object.keys(seenMap).length === 0 && !didFirstRun.current;

    if (isFirstEver) {
      didFirstRun.current = true;
      const fresh: SeenMap = {};
      for (const type of coffeeTypes) fresh[type.id] = type.updatedAt;
      setSeenMap(fresh);
      void writeJson(storageKey(userId), fresh);
      setNovelIds(new Set());
      return;
    }

    const novel = new Set<string>();
    for (const type of coffeeTypes) {
      const seenAt = seenMap[type.id];
      if (seenAt === undefined) {
        novel.add(type.id);
      } else if (new Date(type.updatedAt).getTime() > new Date(seenAt).getTime()) {
        novel.add(type.id);
      }
    }
    setNovelIds(novel);
  }, [userId, seenMap, coffeeTypes]);

  const markSeen = useCallback(
    (coffeeTypeId: string) => {
      // Wait until the stored map has loaded, otherwise the first-ever
      // silent init would treat every other type as "novel".
      if (!userId || !coffeeTypes || seenMap === null) return;
      const type = coffeeTypes.find((candidate) => candidate.id === coffeeTypeId);
      if (!type) return;

      setSeenMap((prev) => {
        const next = { ...(prev ?? {}), [coffeeTypeId]: type.updatedAt };
        void writeJson(storageKey(userId), next);
        return next;
      });
      setNovelIds((prev) => {
        const next = new Set(prev);
        next.delete(coffeeTypeId);
        return next;
      });
    },
    [userId, coffeeTypes, seenMap]
  );

  return { novelIds, markSeen };
}
