// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const db = new Map<string, unknown>();
vi.mock("idb-keyval", () => ({
  get: async (k: string) => db.get(k),
  set: async (k: string, v: unknown) => void db.set(k, v),
  del: async (k: string) => void db.delete(k),
}));

const push = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => "/documentos",
  useRouter: () => ({ push }),
}));

vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

import { FILES_CHANGED_EVENT, filesKey } from "@/lib/files/persistence";
import { MOCK_USER } from "@/lib/mock/user";
import { readKey } from "@/lib/notifications/readState";

import { NotificationsBell } from "./NotificationsBell";

const stored = (id: string, extra: object = {}) => ({
  id,
  name: `${id}.png`,
  size: 1,
  type: "image/png",
  addedAt: 10,
  blob: new Blob(["x"]),
  status: "pending",
  ...extra,
});

const owner = filesKey(MOCK_USER.participantId);

describe("NotificationsBell", () => {
  beforeEach(() => {
    db.clear();
    window.localStorage.clear();
    push.mockClear();
  });
  afterEach(cleanup);

  it("shows the unread count in the label and badge once loaded", async () => {
    db.set(owner, { logos: [stored("a", { status: "approved", reviewedAt: Date.now() })] });
    render(<NotificationsBell audience="participant" />);
    expect(await screen.findByRole("button", { name: "Notificaciones, 1 sin leer" })).toBeTruthy();
    expect(screen.getByText("1")).toBeTruthy();
  });

  it("renders no badge when there is nothing unread", async () => {
    render(<NotificationsBell audience="participant" />);
    expect(await screen.findByRole("button", { name: "Notificaciones" })).toBeTruthy();
  });

  it("picks up a change announced in the same tab", async () => {
    render(<NotificationsBell audience="participant" />);
    await screen.findByRole("button", { name: "Notificaciones" });
    db.set(owner, { logos: [stored("a", { comment: "Hola", commentedAt: Date.now() })] });
    await act(async () => {
      window.dispatchEvent(new Event(FILES_CHANGED_EVENT));
    });
    expect(await screen.findByRole("button", { name: "Notificaciones, 1 sin leer" })).toBeTruthy();
  });

  it("marks a row read, navigates to the folder and persists the read id", async () => {
    db.set(owner, { logos: [stored("a", { status: "rejected", reviewedAt: Date.now() })] });
    render(<NotificationsBell audience="participant" />);
    fireEvent.click(await screen.findByRole("button", { name: "Notificaciones, 1 sin leer" }));
    fireEvent.click(await screen.findByRole("button", { name: /a\.png fue rechazado/ }));
    expect(push).toHaveBeenCalledWith("/documentos/logos");
    await screen.findByRole("button", { name: "Notificaciones" });
    expect(JSON.parse(window.localStorage.getItem(readKey("participant")) ?? "[]")).toHaveLength(1);
  });

  it("marks everything read from the footer", async () => {
    db.set(owner, {
      logos: [
        stored("a", { status: "approved", reviewedAt: Date.now() }),
        stored("b", { status: "approved", reviewedAt: Date.now() }),
      ],
    });
    render(<NotificationsBell audience="participant" />);
    fireEvent.click(await screen.findByRole("button", { name: "Notificaciones, 2 sin leer" }));
    fireEvent.click(await screen.findByRole("button", { name: "Marcar leídas" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Notificaciones" })).toBeTruthy());
  });

  it("caps the badge at 99+", async () => {
    const files = Array.from({ length: 100 }, (_, i) => stored(`f${i}`, { status: "approved", reviewedAt: 1000 + i }));
    db.set(owner, { logos: files });
    render(<NotificationsBell audience="participant" />);
    expect(await screen.findByText("99+")).toBeTruthy();
  });
});
