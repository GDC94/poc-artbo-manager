// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AdminProvider } from "@/lib/admin/store";
import { ToastProvider } from "@/components/app/shared/ToastProvider";

const db = new Map<string, unknown>();
const setSpy = vi.fn();
vi.mock("idb-keyval", () => ({
  get: async (k: string) => db.get(k),
  set: async (k: string, v: unknown) => {
    setSpy(k, v);
    db.set(k, v);
  },
  del: async (k: string) => void db.delete(k),
}));
vi.mock("next/navigation", () => ({ usePathname: () => "/admin" }));
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

import { AdminHome } from "./AdminHome";

const f = (id: string, status?: string) => ({
  id,
  name: `${id}.png`,
  size: 1,
  type: "image/png",
  addedAt: 1,
  blob: new Blob(["x"]),
  ...(status ? { status } : {}),
});

const renderHome = () =>
  render(
    <ToastProvider>
      <AdminProvider>
        <AdminHome />
      </AdminProvider>
    </ToastProvider>,
  );

describe("AdminHome pending indicator", () => {
  beforeEach(() => {
    db.clear();
    setSpy.mockClear();
    window.localStorage.clear();
  });
  afterEach(cleanup);

  it("shows plural and singular counts on desktop and mobile rows, linking to the documents tab", async () => {
    db.set("artbo:files:v1:p-01", { logos: [f("a"), f("b")], oculta: [f("c", "approved"), f("d")] });
    db.set("artbo:files:v1:p-02", { logos: [f("e", "pending"), f("g", "rejected")] });
    renderHome();

    const plural = await screen.findAllByRole("link", { name: /3 pendientes/ });
    expect(plural).toHaveLength(2);
    for (const link of plural) {
      expect(link.getAttribute("href")).toBe("/admin/participantes/p-01?tab=documentos");
      expect(link.textContent).toBe("3 pendientes");
    }
    const singular = screen.getAllByRole("link", { name: /1 pendiente(?!s)/ });
    expect(singular).toHaveLength(2);
    expect(singular[0].textContent).toBe("1 pendiente");
    expect(singular[0].getAttribute("href")).toBe("/admin/participantes/p-02?tab=documentos");
  });

  it("shows nothing for participants without pending files, and never writes", async () => {
    db.set("artbo:files:v1:p-01", { logos: [f("a", "approved")] });
    renderHome();
    await screen.findAllByText("Valentina Ospina Duarte");
    await act(async () => {});
    expect(screen.queryByText(/pendiente/)).toBeNull();
    expect(setSpy).not.toHaveBeenCalled();
  });

  it("refreshes the counts when the window regains focus", async () => {
    renderHome();
    await screen.findAllByText("Valentina Ospina Duarte");
    await act(async () => {});
    expect(screen.queryByText(/pendiente/)).toBeNull();

    db.set("artbo:files:v1:p-01", { logos: [f("a")] });
    await act(async () => {
      window.dispatchEvent(new Event("focus"));
    });
    await waitFor(() => expect(screen.getAllByText("1 pendiente")).toHaveLength(2));
    expect(setSpy).not.toHaveBeenCalled();
  });
});
