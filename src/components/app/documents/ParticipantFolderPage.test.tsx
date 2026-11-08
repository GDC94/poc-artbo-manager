// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ToastProvider } from "@/components/app/shared/ToastProvider";
import { AdminProvider } from "@/lib/admin/store";
import { BrandProvider } from "@/lib/brand/store";

import { ParticipantFolderPage } from "./ParticipantFolderPage";

const db = new Map<string, unknown>();
vi.mock("idb-keyval", () => ({
  get: async (k: string) => db.get(k),
  set: async (k: string, v: unknown) => void db.set(k, v),
  del: async (k: string) => void db.delete(k),
}));
vi.mock("next/navigation", () => ({ usePathname: () => "/documentos/x" }));

vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

const renderPage = (folder: string) =>
  render(
    <ToastProvider>
      <BrandProvider>
        <AdminProvider>
          <ParticipantFolderPage folder={folder} />
        </AdminProvider>
      </BrandProvider>
    </ToastProvider>,
  );

describe("ParticipantFolderPage", () => {
  beforeEach(() => {
    db.clear();
    window.localStorage.clear();
    window.localStorage.setItem("artbo:admin:selections:v2", JSON.stringify({ "p-01": ["logos"] }));
  });
  afterEach(cleanup);

  it("renders an enabled folder", async () => {
    renderPage("logos");
    expect(await screen.findByRole("link", { name: /Volver a/ })).toBeTruthy();
  });

  it("shows not-found for a folder that is not enabled", async () => {
    renderPage("imagenes");
    expect(await screen.findByText("No encontramos esta carpeta")).toBeTruthy();
  });

  const stored = (status?: string) => ({
    id: "a",
    name: "a.png",
    size: 1,
    type: "image/png",
    addedAt: 1,
    blob: new Blob(["x"]),
    ...(status ? { status } : {}),
  });

  it("shows the decision the admin persisted for the viewer", async () => {
    db.set("artbo:files:v1:p-01", { logos: [stored("approved")] });
    renderPage("logos");
    expect(await screen.findByText("Aprobado")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /^Aprobar/ })).toBeNull();
  });

  it("adopts files saved under the legacy key as pending", async () => {
    db.set("artbo:files:v1", { logos: [stored("approved")] });
    renderPage("logos");
    expect(await screen.findByText("Pendiente")).toBeTruthy();
    expect(db.has("artbo:files:v1")).toBe(false);
    expect(db.has("artbo:files:v1:p-01")).toBe(true);
  });
});
