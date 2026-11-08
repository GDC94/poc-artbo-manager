import { describe, expect, it } from "vitest";

import {
  addRequirement,
  activeIds,
  slugifyRequirement,
  visibleFoldersFor,
  toggleRequirementActive,
  toggleSelection,
  validateRequirementName,
} from "./requirements";
import type { Requirement } from "./types";

const catalog: Requirement[] = [
  { id: "r1", label: "Planos Stand", active: true },
  { id: "r2", label: "Imágenes", active: false },
];

describe("validateRequirementName", () => {
  it("rejects empty and blank names", () => {
    expect(validateRequirementName("", catalog)).toMatch(/nombre/i);
    expect(validateRequirementName("   ", catalog)).toMatch(/nombre/i);
  });
  it("rejects duplicates ignoring case and accents-insensitive spacing", () => {
    expect(validateRequirementName("planos stand", catalog)).toMatch(/existe/i);
    expect(validateRequirementName("  IMÁGENES ", catalog)).toMatch(/existe/i);
  });
  it("accepts a new name", () => {
    expect(validateRequirementName("Contratos", catalog)).toBeNull();
  });
});

describe("addRequirement", () => {
  it("appends an active, trimmed requirement", () => {
    const res = addRequirement(catalog, "  Contratos ");
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.catalog.at(-1)).toEqual({ id: "contratos", label: "Contratos", active: true });
  });
  it("returns the error instead of appending an invalid name", () => {
    const res = addRequirement(catalog, "planos stand");
    expect(res.ok).toBe(false);
  });
});

describe("toggleRequirementActive", () => {
  it("flips only the matching item", () => {
    const next = toggleRequirementActive(catalog, "r2");
    expect(next[1].active).toBe(true);
    expect(next[0].active).toBe(true);
    expect(catalog[1].active).toBe(false);
  });
});

describe("toggleSelection", () => {
  it("adds and removes an id", () => {
    expect(toggleSelection(["r1"], "r2")).toEqual(["r1", "r2"]);
    expect(toggleSelection(["r1", "r2"], "r1")).toEqual(["r2"]);
  });
});

describe("activeIds", () => {
  it("lists only active requirement ids", () => {
    expect(activeIds(catalog)).toEqual(["r1"]);
  });
});

describe("slugifyRequirement", () => {
  it("lowercases, strips accents and hyphenates", () => {
    expect(slugifyRequirement("Guías de Marca", [])).toBe("guias-de-marca");
    expect(slugifyRequirement("  Planos & Stand! ", [])).toBe("planos-stand");
    expect(slugifyRequirement("Año 2026", [])).toBe("ano-2026");
  });
  it("appends -2, -3 on collision", () => {
    expect(slugifyRequirement("Logos", ["logos"])).toBe("logos-2");
    expect(slugifyRequirement("Logos", ["logos", "logos-2"])).toBe("logos-3");
  });
  it("falls back to a non-empty slug", () => {
    expect(slugifyRequirement("!!!", [])).toBe("requerimiento");
    expect(slugifyRequirement("???", ["requerimiento"])).toBe("requerimiento-2");
  });
});

describe("addRequirement id", () => {
  it("derives a unique slug id from the name", () => {
    const base: Requirement[] = [{ id: "contratos", label: "Otro", active: true }];
    const res = addRequirement(base, "Contratos");
    expect(res.ok && res.catalog.at(-1)?.id).toBe("contratos-2");
  });
});

describe("visibleFoldersFor", () => {
  const reqs: Requirement[] = [
    { id: "a", label: "Alfa", active: true },
    { id: "b", label: "Beta", active: false },
    { id: "c", label: "Gamma", active: true },
  ];
  it("keeps active + selected requirements in catalog order", () => {
    expect(visibleFoldersFor("p", reqs, { p: ["c", "a", "b"] })).toEqual([
      { key: "a", label: "Alfa" },
      { key: "c", label: "Gamma" },
    ]);
  });
  it("hides inactive requirements even if selected", () => {
    expect(visibleFoldersFor("p", reqs, { p: ["b"] })).toEqual([]);
  });
  it("is empty for an unknown participant", () => {
    expect(visibleFoldersFor("nobody", reqs, { p: ["a"] })).toEqual([]);
  });
});
