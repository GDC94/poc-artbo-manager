// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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
const file = (id: string, extra: object = {}) => ({
  id,
  name: `${id}.png`,
  size: 1,
  type: "image/png",
  addedAt: 1,
  blob: new Blob(["x"]),
  status: "approved",
  ...extra,
});

type Saved = { id: string; deletionRequest?: { status: string; requestedAt: number; resolvedAt?: number } };
const saved = () => (db.get(filesKey("p-01")) as { logos: Saved[] }).logos;
const seed = (...files: object[]) => db.set(filesKey("p-01"), { logos: files });

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

const requested = { status: "requested", requestedAt: 5 };

describe("participant deletion requests in the folder page", () => {
  beforeEach(() => {
    db.clear();
    window.localStorage.clear();
  });
  afterEach(cleanup);

  it("keeps direct deletion for pending and rejected files, and asks for a request on approved ones", async () => {
    seed(file("a", { status: "pending" }), file("b", { status: "rejected" }), file("c"));
    renderWorkspace(false);
    expect(await screen.findByRole("button", { name: "Quitar a.png" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Quitar b.png" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Solicitar eliminación de c.png" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Quitar c.png" })).toBeNull();
  });

  it("asks for confirmation, records the request, toasts and shows the indicator", async () => {
    seed(file("c"));
    renderWorkspace(false);
    fireEvent.click(await screen.findByRole("button", { name: "Solicitar eliminación de c.png" }));
    const dialog = await screen.findByRole("dialog", { name: "Solicitar eliminación" });
    expect(within(dialog).getByText(/administrador/)).toBeTruthy();
    expect(saved()[0].deletionRequest).toBeUndefined();
    fireEvent.click(within(dialog).getByRole("button", { name: "Solicitar eliminación" }));
    expect(await screen.findByText("Solicitud de eliminación enviada")).toBeTruthy();
    expect(screen.getByText("Eliminación solicitada")).toBeTruthy();
    await waitFor(() => expect(saved()[0].deletionRequest).toMatchObject({ status: "requested" }));
    expect(saved()).toHaveLength(1);
    expect((screen.getByRole("button", { name: "Eliminación solicitada de c.png" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("records nothing when the request is cancelled", async () => {
    seed(file("c"));
    renderWorkspace(false);
    fireEvent.click(await screen.findByRole("button", { name: "Solicitar eliminación de c.png" }));
    fireEvent.click(within(await screen.findByRole("dialog", { name: "Solicitar eliminación" })).getByRole("button", { name: "Cancelar" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Solicitar eliminación" })).toBeNull());
    expect(saved()[0].deletionRequest).toBeUndefined();
  });

  it("disables removal while the request waits, and opens no dialog", async () => {
    seed(file("c", { deletionRequest: requested }));
    renderWorkspace(false);
    const button = (await screen.findByRole("button", { name: "Eliminación solicitada de c.png" })) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.click(button);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByText("Eliminación solicitada")).toBeTruthy();
  });

  it("allows the normal delete once the admin approved the request", async () => {
    seed(file("c", { deletionRequest: { status: "approved", requestedAt: 5, resolvedAt: 6 } }));
    renderWorkspace(false);
    expect(await screen.findByText("Eliminación aprobada")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Quitar c.png" }));
    fireEvent.click(within(await screen.findByRole("dialog", { name: "¿Eliminar este archivo?" })).getByRole("button", { name: "Eliminar" }));
    await waitFor(() => expect(saved()).toEqual([]));
  });

  it("shows a rejected request and lets the participant ask again", async () => {
    seed(file("c", { deletionRequest: { status: "rejected", requestedAt: 5, resolvedAt: 6 } }));
    renderWorkspace(false);
    expect(await screen.findByText("Solicitud de eliminación rechazada")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Solicitar eliminación de c.png" }));
    fireEvent.click(within(await screen.findByRole("dialog", { name: "Solicitar eliminación" })).getByRole("button", { name: "Solicitar eliminación" }));
    await waitFor(() => expect(saved()[0].deletionRequest).toMatchObject({ status: "requested" }));
    expect(saved()[0].deletionRequest?.requestedAt).toBeGreaterThan(5);
  });

  it("refuses a delete confirmed after the file became approved elsewhere", async () => {
    seed(file("a", { status: "pending" }));
    renderWorkspace(false);
    fireEvent.click(await screen.findByRole("button", { name: "Quitar a.png" }));
    const dialog = await screen.findByRole("dialog", { name: "¿Eliminar este archivo?" });
    db.set(filesKey("p-01"), { logos: [file("a")] });
    await act(async () => {
      window.dispatchEvent(new Event("focus"));
    });
    await screen.findByRole("button", { name: "Solicitar eliminación de a.png" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Eliminar" }));
    await act(async () => {});
    expect(saved().map((f) => f.id)).toEqual(["a"]);
    expect(screen.getByRole("button", { name: "Solicitar eliminación de a.png" })).toBeTruthy();
  });
});

describe("admin handling of deletion requests", () => {
  beforeEach(() => {
    db.clear();
    window.localStorage.clear();
  });
  afterEach(cleanup);

  it("shows the block only for a pending request, never to the participant", async () => {
    seed(file("a", { deletionRequest: requested }), file("b"));
    renderWorkspace(true);
    expect(await screen.findByText("El participante solicitó eliminar este archivo")).toBeTruthy();
    expect(screen.getAllByText("El participante solicitó eliminar este archivo")).toHaveLength(1);
    cleanup();
    renderWorkspace(false);
    await screen.findByText("Eliminación solicitada");
    expect(screen.queryByText("El participante solicitó eliminar este archivo")).toBeNull();
  });

  it("approving keeps the file, records the resolution and toasts", async () => {
    seed(file("a", { deletionRequest: requested }));
    renderWorkspace(true);
    fireEvent.click(await screen.findByRole("button", { name: "Aprobar eliminación de a.png" }));
    expect(await screen.findByText("Eliminación de a.png aprobada")).toBeTruthy();
    await waitFor(() => expect(saved()[0].deletionRequest).toMatchObject({ status: "approved" }));
    expect(saved()).toHaveLength(1);
    expect(saved()[0].deletionRequest?.resolvedAt).toEqual(expect.any(Number));
    expect(screen.queryByText("El participante solicitó eliminar este archivo")).toBeNull();
  });

  it("rejecting the request records it and toasts", async () => {
    seed(file("a", { deletionRequest: requested }));
    renderWorkspace(true);
    fireEvent.click(await screen.findByRole("button", { name: "Rechazar solicitud de eliminación de a.png" }));
    expect(await screen.findByText("Solicitud de eliminación de a.png rechazada")).toBeTruthy();
    await waitFor(() => expect(saved()[0].deletionRequest).toMatchObject({ status: "rejected" }));
  });

  it("rejecting the file itself clears the request", async () => {
    seed(file("a", { deletionRequest: requested }));
    renderWorkspace(true);
    fireEvent.click(await screen.findByRole("button", { name: "Rechazar a.png" }));
    await waitFor(() => expect(saved()[0].deletionRequest).toBeUndefined());
    expect(screen.queryByText("El participante solicitó eliminar este archivo")).toBeNull();
  });
});

describe("deletion requests in the folder sheet", () => {
  beforeEach(() => {
    db.clear();
    window.localStorage.clear();
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

  it("lets the participant request deletion from the sheet", async () => {
    seed(file("c"));
    await open(false);
    fireEvent.click(await screen.findByRole("button", { name: "Solicitar eliminación de c.png" }));
    fireEvent.click(within(await screen.findByRole("dialog", { name: "Solicitar eliminación" })).getByRole("button", { name: "Solicitar eliminación" }));
    expect(await screen.findByText("Solicitud de eliminación enviada")).toBeTruthy();
    await waitFor(() => expect(saved()[0].deletionRequest).toMatchObject({ status: "requested" }));
    expect(saved()).toHaveLength(1);
  });

  it("lets the admin approve the request from the sheet", async () => {
    seed(file("a", { deletionRequest: requested }));
    await open(true);
    fireEvent.click(await screen.findByRole("button", { name: "Aprobar eliminación de a.png" }));
    await waitFor(() => expect(saved()[0].deletionRequest).toMatchObject({ status: "approved" }));
    expect(saved()).toHaveLength(1);
  });

  it("does not let the participant delete an approved file with a pending request", async () => {
    seed(file("a", { deletionRequest: requested }));
    await open(false);
    const button = (await screen.findByRole("button", { name: "Eliminación solicitada de a.png" })) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});
