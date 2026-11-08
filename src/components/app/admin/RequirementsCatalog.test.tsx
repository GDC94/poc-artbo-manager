// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { AdminProvider } from "@/lib/admin/store";
import { SEED_REQUIREMENTS } from "@/lib/mock/participants";

import { RequirementsCatalog } from "./RequirementsCatalog";

const trashName = `Eliminar ${SEED_REQUIREMENTS[0].label}`;

const confirmDialog = { name: "¿Eliminar este requerimiento?" };

const press = (element: HTMLElement) => {
  fireEvent.pointerDown(element);
  fireEvent.mouseDown(element);
  fireEvent.pointerUp(element);
  fireEvent.mouseUp(element);
  fireEvent.click(element);
};

async function openConfirmation() {
  render(
    <AdminProvider>
      <RequirementsCatalog />
    </AdminProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Listado de requerimiento" }));
  const total = (await screen.findAllByRole("checkbox")).length;
  press(screen.getByRole("button", { name: trashName }));
  return { total, dialog: await screen.findByRole("dialog", confirmDialog) };
}

describe("RequirementsCatalog", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(cleanup);

  it("shows an empty state next to the add action when the catalog is empty", async () => {
    window.localStorage.setItem("artbo:admin:requirements:v2", "[]");
    render(
      <AdminProvider>
        <RequirementsCatalog />
      </AdminProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Listado de requerimiento" }));

    expect(await screen.findByText("Todavía no hay requerimientos")).toBeTruthy();
    expect(screen.queryByRole("list", { name: "Requerimientos" })).toBeNull();
    expect(screen.getByRole("button", { name: "Agregar nuevo requerimiento" })).toBeTruthy();
  });

  it("asks for confirmation, warning it affects every participant, before removing", async () => {
    const { total, dialog } = await openConfirmation();

    expect(dialog.textContent).toContain(SEED_REQUIREMENTS[0].label);
    expect(dialog.textContent).toContain("todos los participantes");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(screen.getAllByRole("checkbox", { hidden: true })).toHaveLength(total);
  });

  it("removes the requirement on confirm and keeps the popover open", async () => {
    const { total, dialog } = await openConfirmation();

    press(within(dialog).getByRole("button", { name: "Eliminar" }));

    await waitFor(() => expect(screen.queryByRole("dialog", confirmDialog)).toBeNull());
    expect(screen.queryByRole("button", { name: trashName })).toBeNull();
    expect(screen.getAllByRole("checkbox")).toHaveLength(total - 1);
  });

  it("keeps the requirement and the popover on cancel", async () => {
    const { total, dialog } = await openConfirmation();

    press(within(dialog).getByRole("button", { name: "Cancelar" }));

    await waitFor(() => expect(screen.queryByRole("dialog", confirmDialog)).toBeNull());
    expect(screen.getByRole("button", { name: trashName })).toBeTruthy();
    expect(screen.getAllByRole("checkbox")).toHaveLength(total);
  });
});
