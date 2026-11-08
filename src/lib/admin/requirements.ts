import type { FolderDef } from "@/lib/files/folders";

import type { Requirement } from "./types";

/**
 * Catalog semantics: a requirement is global (shared by every participant). Its
 * checkbox in the "Listado de requerimiento" popover is `active`: active
 * requirements are the ones offered in each participant's dropdown; inactive ones
 * are hidden there but keep any selection already made, which returns if the
 * requirement is activated again. New requirements start active. Removing a
 * requirement is permanent: it also drops it from every participant's selection.
 */

const normalize = (name: string) => name.trim().replace(/\s+/g, " ").toLocaleLowerCase("es");

export function validateRequirementName(name: string, catalog: Requirement[]): string | null {
  if (!name.trim()) return "Escribe el nombre del requerimiento";
  const key = normalize(name);
  if (catalog.some((r) => normalize(r.label) === key)) return "Ya existe un requerimiento con ese nombre";
  return null;
}

export type AddRequirementResult =
  | { ok: true; catalog: Requirement[] }
  | { ok: false; error: string };

/**
 * Requirement id == folder key == route segment. Lowercase, accents stripped, anything
 * non-alphanumeric collapsed to a hyphen; `-2`, `-3`... on collision with `existingIds`.
 */
export function slugifyRequirement(label: string, existingIds: readonly string[]): string {
  const base =
    label
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "requerimiento";
  if (!existingIds.includes(base)) return base;
  let n = 2;
  while (existingIds.includes(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

export function addRequirement(catalog: Requirement[], name: string): AddRequirementResult {
  const error = validateRequirementName(name, catalog);
  if (error) return { ok: false, error };
  const id = slugifyRequirement(name, catalog.map((r) => r.id));
  return { ok: true, catalog: [...catalog, { id, label: name.trim().replace(/\s+/g, " "), active: true }] };
}

/** Every requirement of the catalog as a folder (admin view: active or not, no selection filter). */
export function foldersFromRequirements(catalog: readonly Requirement[]): FolderDef[] {
  return catalog.map((r) => ({ key: r.id, label: r.label }));
}

/** Folders a participant sees: requirement is active AND selected for them, in catalog order. */
export function visibleFoldersFor(
  participantId: string,
  catalog: readonly Requirement[],
  selections: Record<string, string[]>,
): FolderDef[] {
  const selected = selections[participantId] ?? [];
  return foldersFromRequirements(catalog.filter((r) => r.active && selected.includes(r.id)));
}

export function toggleRequirementActive(catalog: Requirement[], id: string): Requirement[] {
  return catalog.map((r) => (r.id === id ? { ...r, active: !r.active } : r));
}

export function removeRequirementFromSelections(
  selections: Record<string, string[]>,
  id: string,
): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(selections).map(([participantId, selected]) => [
      participantId,
      selected.filter((s) => s !== id),
    ]),
  );
}

export function toggleSelection(selected: string[], id: string): string[] {
  return selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
}

export function activeIds(catalog: Requirement[]): string[] {
  return catalog.filter((r) => r.active).map((r) => r.id);
}

export function isRequirement(value: unknown): value is Requirement {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === "string" && typeof v.label === "string" && typeof v.active === "boolean";
}
