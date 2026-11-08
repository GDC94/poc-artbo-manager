// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
  status: "pending",
  ...extra,
});

const savedFile = () => (db.get(filesKey("p-01")) as { logos: Record<string, unknown>[] }).logos[0];

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

describe("admin comment on a file", () => {
  beforeEach(() => {
    db.clear();
    window.localStorage.clear();
    db.set(filesKey("p-01"), { logos: [file("a")] });
  });
  afterEach(cleanup);

  it("offers a textarea seeded from the saved comment, only to the admin", async () => {
    db.set(filesKey("p-01"), { logos: [file("a", { comment: "Sube el vector", commentedAt: 5 })] });
    renderWorkspace(true);
    const box = (await screen.findByLabelText("Comentario para a.png")) as HTMLTextAreaElement;
    expect(box.value).toBe("Sube el vector");
    expect(box.placeholder).toBe("Deja un comentario sobre este archivo");
  });

  it("shows the save control only when the draft differs from the saved comment", async () => {
    renderWorkspace(true);
    const box = await screen.findByLabelText("Comentario para a.png");
    expect(screen.queryByRole("button", { name: /Guardar comentario/ })).toBeNull();
    fireEvent.change(box, { target: { value: "Falta el fondo" } });
    expect(screen.getByRole("button", { name: /Guardar comentario/ })).toBeTruthy();
    fireEvent.change(box, { target: { value: "" } });
    expect(screen.queryByRole("button", { name: /Guardar comentario/ })).toBeNull();
  });

  it("saves the comment, confirms in a toast and persists it", async () => {
    renderWorkspace(true);
    fireEvent.change(await screen.findByLabelText("Comentario para a.png"), { target: { value: "  Falta el fondo " } });
    fireEvent.click(screen.getByRole("button", { name: /Guardar comentario/ }));
    expect(await screen.findByText("Comentario guardado")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Guardar comentario/ })).toBeNull();
    await waitFor(() => expect(savedFile()).toMatchObject({ comment: "Falta el fondo" }));
    expect(typeof savedFile().commentedAt).toBe("number");
  });

  it("persists a dirty draft together with a decision", async () => {
    renderWorkspace(true);
    fireEvent.change(await screen.findByLabelText("Comentario para a.png"), { target: { value: "Rehacer" } });
    fireEvent.click(screen.getByRole("button", { name: "Rechazar a.png" }));
    await waitFor(() => expect(savedFile()).toMatchObject({ status: "rejected", comment: "Rehacer" }));
    expect(typeof savedFile().reviewedAt).toBe("number");
  });

  it("does not touch the comment when deciding with a clean draft", async () => {
    renderWorkspace(true);
    fireEvent.click(await screen.findByRole("button", { name: "Aprobar a.png" }));
    await waitFor(() => expect(savedFile()).toMatchObject({ status: "approved" }));
    expect(savedFile()).not.toHaveProperty("comment");
  });

  it("works from the folder sheet too", async () => {
    render(
      <ToastProvider>
        <BrandProvider ownerId="p-01">
          <FilesProvider ownerId="p-01">
            <BrandForm folders={[logos]} reviewable />
          </FilesProvider>
        </BrandProvider>
      </ToastProvider>,
    );
    fireEvent.click(await screen.findByRole("button", { name: /^Logos,.*(1 archivo)/ }));
    fireEvent.change(await screen.findByLabelText("Comentario para a.png"), { target: { value: "Hola" } });
    fireEvent.click(screen.getByRole("button", { name: /Guardar comentario/ }));
    await waitFor(() => expect(savedFile()).toMatchObject({ comment: "Hola" }));
  });
});

describe("participant view of the comment", () => {
  beforeEach(() => {
    db.clear();
    window.localStorage.clear();
  });
  afterEach(cleanup);

  it("shows the admin's comment read-only", async () => {
    db.set(filesKey("p-01"), { logos: [file("a", { comment: "Línea 1\nLínea 2", commentedAt: 5 })] });
    renderWorkspace(false);
    expect(await screen.findByText("Comentario del administrador")).toBeTruthy();
    expect(screen.getByText(/Línea 1/).className).toContain("whitespace-pre-wrap");
    expect(screen.queryByLabelText("Comentario para a.png")).toBeNull();
  });

  it("shows nothing when there is no comment", async () => {
    db.set(filesKey("p-01"), { logos: [file("a")] });
    renderWorkspace(false);
    await screen.findByText("Pendiente");
    expect(screen.queryByText("Comentario del administrador")).toBeNull();
  });
});
