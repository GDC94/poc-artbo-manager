"use client";

import { useEffect, useState } from "react";

import { loadPendingCounts } from "./persistence";

/**
 * Pending-file count per participant, read from their owned IndexedDB keys. `null` until the
 * first read finishes (render nothing rather than a wrong number). Read-only: it never writes,
 * keeps only counts (no blobs) and re-reads when the window regains focus or becomes visible.
 */
export function usePendingCounts(ownerIds: readonly string[]): Record<string, number> | null {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const idsKey = ownerIds.join("\u0000");

  useEffect(() => {
    let active = true;
    const ids = idsKey ? idsKey.split("\u0000") : [];
    const read = () => {
      if (document.visibilityState === "hidden") return;
      loadPendingCounts(ids)
        .then((next) => {
          if (active) setCounts(next);
        })
        .catch(() => {});
    };
    read();
    window.addEventListener("focus", read);
    document.addEventListener("visibilitychange", read);
    return () => {
      active = false;
      window.removeEventListener("focus", read);
      document.removeEventListener("visibilitychange", read);
    };
  }, [idsKey]);

  return counts;
}
