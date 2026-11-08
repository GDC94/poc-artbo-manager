// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ToastProvider } from "@/components/app/shared/ToastProvider";
import { BrandProvider } from "@/lib/brand/store";
import { filesKey } from "@/lib/files/persistence";
import { FilesProvider } from "@/lib/files/store";

import { BrandForm } from "./BrandForm";
import { FolderWorkspace } from "./FolderWorkspace";

const db = new Map<string, unknown>();
vi.mock("idb-keyval", () => ({
  get: async (k: string) => db.get(k),
  set: async (k: string, v: unknown) => void db.set(k, v),
  del: async (k: string) => void db.delete(k),
}));

vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);
vi.stubGlobal("URL", Object.assign(URL, { createObjectURL: () => "blob:x", revokeObjectURL: () => {} }));

const logos = { key: "logos", label: "Logos" };
const file = (id: string, status?: string) => ({
  id,
  name: `${id}.png`,
  size: 1,
  type: "image/png",
  addedAt: 1,
  blob: new Blob(["x"]),
  ...(status ? { status } : {}),
});

function renderWorkspace(reviewable: boolean) {
  return render(
    <ToastProvider>
      <BrandProvider ownerId="p-01">
        <FilesProvider ownerId="p-01">
          <FolderWorkspace folder={logos} reviewable={reviewable} />
        </FilesProvider>
      </BrandProvider>
    </ToastProvider>,
  );
}

describe("file review in the folder page", () => {
  beforeEach(() => {
    db.clear();
    window.localStorage.clear();
    db.set(filesKey("p-01"), { logos: [file("a"), file("b", "approved"), file("c", "rejected")] });
  });
  afterEach(cleanup);

  it("shows a status badge on every file, for the participant too", async () => {
    renderWorkspace(false);
    expect(await screen.findByText("Pendiente")).toBeTruthy();
    expect(screen.getByText("Aprobado")).toBeTruthy();
    expect(screen.getByText("Rechazado")).toBeTruthy();
  });

  it("gives the participant no review actions", async () => {
    renderWorkspace(false);
    await screen.findByText("Pendiente");
    expect(screen.queryByRole("button", { name: /^Aprobar/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /^Rechazar/ })).toBeNull();
    expect(screen.getByRole("button", { name: "Quitar a.png" })).toBeTruthy();
  });

  it("offers the admin only the decisions a file is not already in", async () => {
    renderWorkspace(true);
    await screen.findByText("Pendiente");
    expect(screen.getByRole("button", { name: "Aprobar a.png" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Rechazar a.png" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Aprobar b.png" })).toBeNull();
    expect(screen.getByRole("button", { name: "Rechazar b.png" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Aprobar c.png" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Rechazar c.png" })).toBeNull();
  });

  it("approving changes the badge, announces it and persists the decision", async () => {
    renderWorkspace(true);
    fireEvent.click(await screen.findByRole("button", { name: "Aprobar a.png" }));
    expect(screen.queryByRole("button", { name: "Aprobar a.png" })).toBeNull();
    expect(screen.getAllByText("Aprobado")).toHaveLength(2);
    expect(screen.queryByText("Pendiente")).toBeNull();
    expect(await screen.findByText(/a\.png aprobado/)).toBeTruthy();
    await waitFor(() =>
      expect((db.get(filesKey("p-01")) as { logos: { id: string; status: string }[] }).logos[0]).toMatchObject({
        id: "a",
        status: "approved",
      }),
    );
  });
});

describe("file review in the folder sheet", () => {
  beforeEach(() => {
    db.clear();
    window.localStorage.clear();
    db.set(filesKey("p-01"), { logos: [file("a")] });
  });
  afterEach(cleanup);

  const open = async (reviewable: boolean) => {
    render(
      <ToastProvider>
        <BrandProvider ownerId="p-01">
          <FilesProvider ownerId="p-01">
            <BrandForm folders={[logos]} reviewable={reviewable} />
          </FilesProvider>
        </BrandProvider>
      </ToastProvider>,
    );
    fireEvent.click(await screen.findByRole("button", { name: /^Logos,.*(1 archivo)/ }));
  };

  it("lets the admin decide from the sheet", async () => {
    await open(true);
    fireEvent.click(await screen.findByRole("button", { name: "Rechazar a.png" }));
    expect((await screen.findAllByText("Rechazado")).length).toBeGreaterThan(0);
  });

  it("does not show the actions to the participant", async () => {
    await open(false);
    await screen.findByText("Pendiente");
    expect(screen.queryByRole("button", { name: /^Aprobar/ })).toBeNull();
  });
});

describe("confirming a file removal", () => {
  beforeEach(() => {
    db.clear();
    window.localStorage.clear();
    db.set(filesKey("p-01"), { logos: [file("a"), file("b")] });
  });
  afterEach(cleanup);

  const persisted = () => (db.get(filesKey("p-01")) as { logos: { id: string }[] }).logos.map((f) => f.id);
  const confirmation = () => screen.findByRole("dialog", { name: "¿Eliminar este archivo?" });

  it.each([false, true])("asks before removing, for reviewable=%s", async (reviewable) => {
    renderWorkspace(reviewable);
    fireEvent.click(await screen.findByRole("button", { name: "Quitar a.png" }));
    const dialog = await confirmation();
    expect(within(dialog).getByText(/«a\.png» se eliminará de esta carpeta/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Quitar a.png" })).toBeTruthy();
    expect(persisted()).toEqual(["a", "b"]);
  });

  it("keeps the file when cancelled", async () => {
    renderWorkspace(false);
    fireEvent.click(await screen.findByRole("button", { name: "Quitar a.png" }));
    fireEvent.click(within(await confirmation()).getByRole("button", { name: "Cancelar" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "¿Eliminar este archivo?" })).toBeNull());
    expect(screen.getByRole("button", { name: "Quitar a.png" })).toBeTruthy();
    expect(persisted()).toEqual(["a", "b"]);
  });

  it("removes the file when confirmed", async () => {
    renderWorkspace(false);
    fireEvent.click(await screen.findByRole("button", { name: "Quitar a.png" }));
    fireEvent.click(within(await confirmation()).getByRole("button", { name: "Eliminar" }));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Quitar a.png" })).toBeNull());
    await waitFor(() => expect(persisted()).toEqual(["b"]));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "¿Eliminar este archivo?" })).toBeNull());
  });

  describe("in the sheet", () => {
    const openSheet = async () => {
      render(
        <ToastProvider>
          <BrandProvider ownerId="p-01">
            <FilesProvider ownerId="p-01">
              <BrandForm folders={[logos]} />
            </FilesProvider>
          </BrandProvider>
        </ToastProvider>,
      );
      fireEvent.click(await screen.findByRole("button", { name: /^Logos,.*(2 archivos)/ }));
      fireEvent.click(await screen.findByRole("button", { name: "Quitar a.png" }));
      return confirmation();
    };

    it("confirms, then removes the file", async () => {
      const dialog = await openSheet();
      expect(persisted()).toEqual(["a", "b"]);
      fireEvent.click(within(dialog).getByRole("button", { name: "Eliminar" }));
      await waitFor(() => expect(persisted()).toEqual(["b"]));
      await waitFor(() => expect(screen.queryByRole("button", { name: "Quitar a.png" })).toBeNull());
    });

    it("closes only the confirmation on Escape", async () => {
      const dialog = await openSheet();
      fireEvent.keyDown(dialog, { key: "Escape" });
      await waitFor(() => expect(screen.queryByRole("dialog", { name: "¿Eliminar este archivo?" })).toBeNull());
      expect(screen.getByRole("button", { name: "Quitar a.png" })).toBeTruthy();
      expect(persisted()).toEqual(["a", "b"]);
    });
  });
});
