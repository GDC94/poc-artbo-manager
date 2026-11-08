import { describe, expect, it } from "vitest";

import {
  addRequirement,
  activeIds,
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
    const res = addRequirement(catalog, "  Contratos ", "r3");
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.catalog.at(-1)).toEqual({ id: "r3", label: "Contratos", active: true });
  });
  it("returns the error instead of appending an invalid name", () => {
    const res = addRequirement(catalog, "planos stand", "r3");
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
