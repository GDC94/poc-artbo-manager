"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { FILES_CHANGED_EVENT } from "@/lib/files/persistence";

import { loadNotifications } from "./load";
import { loadReadIds, saveReadIds } from "./readState";
import type { Audience, Notification } from "./types";

export type NotificationItem = Notification & { read: boolean };

/**
 * Notifications of one audience, read from storage (never from a provider). Empty until the
 * first read finishes so server and first client render match. Re-reads on mount, route
 * change, window focus, tab visibility, `reload()` and `artbo:files:changed` (same-tab writes).
 */
export function useNotifications(audience: Audience) {
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<ReadonlySet<string>>(() => new Set());
  const [reloadTick, setReloadTick] = useState(0);

  const reload = useCallback(() => setReloadTick((n) => n + 1), []);

  useEffect(() => {
    let active = true;
    const read = () => {
      if (document.visibilityState === "hidden") return;
      loadNotifications(audience)
        .then((next) => {
          if (!active) return;
          setNotifications(next);
          setReadIds(loadReadIds(audience));
        })
        .catch(() => {});
    };
    read();
    window.addEventListener("focus", read);
    document.addEventListener("visibilitychange", read);
    window.addEventListener(FILES_CHANGED_EVENT, read);
    return () => {
      active = false;
      window.removeEventListener("focus", read);
      document.removeEventListener("visibilitychange", read);
      window.removeEventListener(FILES_CHANGED_EVENT, read);
    };
    // pathname and reloadTick are triggers: a change re-reads.
  }, [audience, pathname, reloadTick]);

  const items = useMemo<NotificationItem[]>(
    () => notifications.map((n) => ({ ...n, read: readIds.has(n.id) })),
    [notifications, readIds],
  );
  const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items]);

  const commit = useCallback(
    (ids: ReadonlySet<string>) => {
      // Ids of events that no longer exist are dropped so the stored set cannot grow forever.
      const live = new Set(notifications.map((n) => n.id));
      const next = new Set([...ids].filter((id) => live.has(id)));
      setReadIds(next);
      saveReadIds(audience, next);
    },
    [audience, notifications],
  );

  const markRead = useCallback((id: string) => commit(new Set(readIds).add(id)), [commit, readIds]);
  const markAllRead = useCallback(
    () => commit(new Set([...readIds, ...notifications.map((n) => n.id)])),
    [commit, readIds, notifications],
  );

  return { items, unreadCount, reload, markRead, markAllRead };
}
