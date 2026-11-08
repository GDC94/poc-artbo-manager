// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ToastProvider } from "@/components/app/shared/ToastProvider";
import { AdminProvider } from "@/lib/admin/store";
import { BrandProvider } from "@/lib/brand/store";

import { ParticipantBrandForm } from "./ParticipantBrandForm";

// jsdom has no IndexedDB; an empty store is all these tests need.
vi.mock("idb-keyval", () => ({ get: async () => undefined, set: async () => {}, del: async () => {} }));

// FolderShape measures itself with ResizeObserver, which jsdom lacks.
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

const SELECTIONS_KEY = "artbo:admin:selections:v2";

function renderForm() {
  return render(
    <ToastProvider>
      <BrandProvider>
        <AdminProvider>
          <ParticipantBrandForm />
        </AdminProvider>
      </BrandProvider>
    </ToastProvider>,
  );
}

describe("ParticipantBrandForm", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(cleanup);

  it("shows only the folders enabled for the viewer", async () => {
    window.localStorage.setItem(SELECTIONS_KEY, JSON.stringify({ "p-01": ["logos", "tipografias"] }));
    renderForm();

    expect(await screen.findByRole("button", { name: /^Logos,/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^Tipografías,/ })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /^Imágenes,/ })).toBeNull();
    expect(screen.queryByText("Todavía no tienes carpetas habilitadas")).toBeNull();
  });

  it("hides a folder whose requirement is inactive", async () => {
    window.localStorage.setItem(SELECTIONS_KEY, JSON.stringify({ "p-01": ["logos", "iconos"] }));
    window.localStorage.setItem(
      "artbo:admin:requirements:v2",
      JSON.stringify([
        { id: "logos", label: "Logos", active: true },
        { id: "iconos", label: "Íconos", active: false },
      ]),
    );
    renderForm();

    expect(await screen.findByRole("button", { name: /^Logos,/ })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /^Íconos,/ })).toBeNull();
  });

  it("shows an empty state when no folder is enabled", async () => {
    window.localStorage.setItem(SELECTIONS_KEY, JSON.stringify({ "p-01": [] }));
    renderForm();

    expect(await screen.findByText("Todavía no tienes carpetas habilitadas")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /^Logos,/ })).toBeNull();
  });
});
