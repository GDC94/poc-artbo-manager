// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { NotificationItem } from "@/lib/notifications/useNotifications";

import { NotificationsPanel } from "./NotificationsPanel";

const NOW = 10_000_000_000;
const item = (id: string, over: Partial<NotificationItem> = {}): NotificationItem => ({
  id,
  kind: "approved",
  title: `${id} aprobado`,
  fileName: `${id}.png`,
  folder: "logos",
  participantId: "p-01",
  at: NOW - 5 * 60_000,
  read: false,
  ...over,
});

const setup = (items: NotificationItem[]) => {
  const onSelect = vi.fn();
  const onMarkAllRead = vi.fn();
  render(<NotificationsPanel items={items} now={NOW} onSelect={onSelect} onMarkAllRead={onMarkAllRead} />);
  return { onSelect, onMarkAllRead };
};

describe("NotificationsPanel", () => {
  afterEach(cleanup);

  it("shows the empty state without chips or footer", () => {
    setup([]);
    expect(screen.getByText("No tienes notificaciones")).toBeTruthy();
    expect(screen.queryByRole("tablist")).toBeNull();
    expect(screen.queryByRole("button", { name: "Marcar leídas" })).toBeNull();
  });

  it("lists rows with kind label and relative time, and counts in the chips", () => {
    setup([item("a"), item("b", { kind: "commented", read: true })]);
    expect(screen.getByRole("tab", { name: "Todas 2" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tab", { name: "Nuevas 1" })).toBeTruthy();
    expect(screen.getAllByText("Hace 5 min")).toHaveLength(2);
    expect(screen.getByText("Comentario")).toBeTruthy();
    expect(screen.getByText("Aprobado")).toBeTruthy();
  });

  it("filters to unread and shows a filtered empty state", () => {
    setup([item("a", { read: true })]);
    fireEvent.click(screen.getByRole("tab", { name: "Nuevas 0" }));
    expect(screen.getByText("No tienes notificaciones nuevas")).toBeTruthy();
  });

  it("selects a notification on click", () => {
    const { onSelect } = setup([item("a")]);
    fireEvent.click(screen.getByRole("button", { name: /a aprobado/ }));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "a" }));
  });

  it("marks all read from the footer, disabled when nothing is unread", () => {
    const { onMarkAllRead } = setup([item("a")]);
    fireEvent.click(screen.getByRole("button", { name: "Marcar leídas" }));
    expect(onMarkAllRead).toHaveBeenCalledTimes(1);
    cleanup();
    setup([item("a", { read: true })]);
    expect((screen.getByRole("button", { name: "Marcar leídas" }) as HTMLButtonElement).disabled).toBe(true);
  });
});
