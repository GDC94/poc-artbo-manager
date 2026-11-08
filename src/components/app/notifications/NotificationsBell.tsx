"use client";

import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Popover } from "@/components/ui/popover";
import { notificationHref } from "@/lib/notifications/destination";
import type { Audience } from "@/lib/notifications/types";
import { useNotifications, type NotificationItem } from "@/lib/notifications/useNotifications";

import { NotificationsPanel } from "./NotificationsPanel";

const badgeText = (count: number) => (count > 99 ? "99+" : String(count));

/** Header bell: unread badge plus the notifications popover of the given audience. */
export function NotificationsBell({ audience }: { audience: Audience }) {
  const router = useRouter();
  const { items, unreadCount, reload, markRead, markAllRead } = useNotifications(audience);
  const [open, setOpen] = useState(false);
  // Reference time of the relative labels; refreshed each time the popover opens.
  const [now, setNow] = useState(0);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setNow(Date.now());
      reload();
    }
  };

  const handleSelect = (item: NotificationItem) => {
    markRead(item.id);
    setOpen(false);
    router.push(notificationHref(item, audience));
  };

  return (
    <Popover
      open={open}
      onOpenChange={handleOpenChange}
      align="end"
      className="flex w-[400px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-lg border-white/10 bg-[#131314] p-0 shadow-[3px_5px_30px_0px_rgba(0,0,0,0.35)]"
      trigger={
        <button
          type="button"
          aria-label={unreadCount > 0 ? `Notificaciones, ${unreadCount} sin leer` : "Notificaciones"}
          className="relative grid size-10 place-items-center rounded-full text-white outline-none hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] lg:size-[34px]"
        >
          <Bell className="size-[18px]" aria-hidden />
          {unreadCount > 0 ? (
            <span
              aria-hidden
              className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground"
            >
              {badgeText(unreadCount)}
            </span>
          ) : null}
        </button>
      }
    >
      {/* Remounted per open so the filter chips start on "Todas". */}
      {open ? (
        <NotificationsPanel items={items} now={now} onSelect={handleSelect} onMarkAllRead={markAllRead} />
      ) : null}
    </Popover>
  );
}
