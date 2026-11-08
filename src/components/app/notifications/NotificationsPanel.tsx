"use client";

import { Bell, Check, FileUp, MessageSquare, X, type LucideIcon } from "lucide-react";
import { useState } from "react";

import { HoverHighlight, HoverHighlightGroup, useHoverHighlightItem } from "@/components/app/shared/HoverHighlight";
import { formatRelativeTime } from "@/lib/notifications/time";
import type { NotificationKind } from "@/lib/notifications/types";
import type { NotificationItem } from "@/lib/notifications/useNotifications";
import { cn } from "@/lib/utils";

const KIND: Record<NotificationKind, { label: string; color: string; Icon: LucideIcon }> = {
  uploaded: { label: "Subida", color: "bg-[#8E8E93]", Icon: FileUp },
  approved: { label: "Aprobado", color: "bg-[#22A65A]", Icon: Check },
  rejected: { label: "Rechazado", color: "bg-rose-400", Icon: X },
  commented: { label: "Comentario", color: "bg-[#E9A208]", Icon: MessageSquare },
};

type Filter = "all" | "unread";

type Props = {
  items: NotificationItem[];
  /** Current time, injected so relative labels are deterministic. */
  now: number;
  onSelect: (item: NotificationItem) => void;
  onMarkAllRead: () => void;
};

function Row({ item, now, onSelect }: { item: NotificationItem; now: number; onSelect: Props["onSelect"] }) {
  const { onMouseEnter, highlight } = useHoverHighlightItem();
  const { label, color, Icon } = KIND[item.kind];

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(item)}
        onMouseEnter={onMouseEnter}
        className="relative isolate grid w-full grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-3 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0071e3]"
      >
        <HoverHighlight {...highlight} className="rounded-lg bg-white/[0.06]" />
        <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", color)}>
          <Icon className="size-4 text-black/70" aria-hidden />
        </span>
        <span className="min-w-0">
          <span
            className={cn(
              "block truncate text-base",
              item.read ? "font-normal text-neutral-400" : "font-semibold text-white",
            )}
          >
            {item.title}
          </span>
          <span className="mt-1.5 flex items-center gap-2">
            <span className="inline-block truncate rounded-md border border-white/15 px-1.5 py-0.5 text-xs text-neutral-300">
              {label}
            </span>
            <span className="text-xs text-neutral-500">{formatRelativeTime(item.at, now)}</span>
          </span>
        </span>
        <span
          aria-hidden
          className={cn("size-2 shrink-0 rounded-full bg-primary", item.read && "invisible")}
        />
      </button>
    </li>
  );
}

/** Popover body: header with filter chips, the list and the mark-all-read footer. */
export function NotificationsPanel({ items, now, onSelect, onMarkAllRead }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const unread = items.filter((n) => !n.read);
  const visible = filter === "unread" ? unread : items;
  const chips: { value: Filter; label: string }[] = [
    { value: "all", label: `Todas ${items.length}` },
    { value: "unread", label: `Nuevas ${unread.length}` },
  ];

  return (
    <>
      <div className="border-b border-white/10 px-5 py-4">
        <h2 className="text-lg font-medium text-white">Notificaciones</h2>
        {items.length > 0 ? (
          <div role="tablist" aria-label="Filtrar notificaciones" className="mt-3 flex items-center gap-2">
            {chips.map((chip) => (
              <button
                key={chip.value}
                type="button"
                role="tab"
                aria-selected={filter === chip.value}
                onClick={() => setFilter(chip.value)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]",
                  filter === chip.value
                    ? "bg-white text-black"
                    : "bg-white/[0.06] text-neutral-400 hover:bg-white/[0.1]",
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {visible.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 px-5 text-neutral-500">
          <Bell className="size-8" strokeWidth={1.5} aria-hidden />
          <p className="text-sm">
            {items.length === 0 ? "No tienes notificaciones" : "No tienes notificaciones nuevas"}
          </p>
        </div>
      ) : (
        <HoverHighlightGroup className="scrollbar-hide min-h-0 max-h-[420px] flex-1 overflow-y-auto px-2">
          <ul>
            {visible.map((item) => (
              <Row key={item.id} item={item} now={now} onSelect={onSelect} />
            ))}
          </ul>
        </HoverHighlightGroup>
      )}

      {items.length > 0 ? (
        <div className="flex items-center justify-end border-t border-white/10 px-5 py-3">
          <button
            type="button"
            onClick={onMarkAllRead}
            disabled={unread.length === 0}
            className="text-xs text-neutral-400 hover:text-neutral-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Marcar leídas
          </button>
        </div>
      ) : null}
    </>
  );
}
