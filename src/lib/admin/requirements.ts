import type { Requirement } from "./types";

/**
 * Catalog semantics: a requirement is global (shared by every participant). Its
 * checkbox in the "Listado de requerimiento" popover is `active`: active
 * requirements are the ones offered in each participant's dropdown; inactive ones
 * are hidden there but keep any selection already made, which returns if the
 * requirement is activated again. New requirements start active.
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

export function addRequirement(catalog: Requirement[], name: string, id: string): AddRequirementResult {
  const error = validateRequirementName(name, catalog);
  if (error) return { ok: false, error };
  return { ok: true, catalog: [...catalog, { id, label: name.trim().replace(/\s+/g, " "), active: true }] };
}

export function toggleRequirementActive(catalog: Requirement[], id: string): Requirement[] {
  return catalog.map((r) => (r.id === id ? { ...r, active: !r.active } : r));
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
