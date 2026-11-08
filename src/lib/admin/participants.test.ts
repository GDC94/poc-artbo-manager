import { describe, expect, it } from "vitest";

import { buildParticipant, filterParticipants, getInitialsFromFullName, hasActiveFilters } from "./participants";
import { NO_FILTERS, type Participant } from "./types";

const base: Omit<Participant, "id" | "type" | "event"> = {
  fullName: "Ana López",
  email: "ana@x.test",
  institution: "Galería X",
  phone: "57 300 000 0000",
  city: "Bogotá",
  country: "Colombia",
};

const list: Participant[] = [
  { ...base, id: "1", type: "Galería", event: "ARTBO Feria" },
  { ...base, id: "2", type: "Galería", event: "Fin de Semana ARTBO" },
  { ...base, id: "3", type: "Editorial", event: "ARTBO Feria" },
];

describe("filterParticipants", () => {
  it("returns everything without filters", () => {
    expect(filterParticipants(list, NO_FILTERS)).toHaveLength(3);
  });
  it("filters by type", () => {
    expect(filterParticipants(list, { type: "Galería", event: null }).map((p) => p.id)).toEqual(["1", "2"]);
  });
  it("filters by event", () => {
    expect(filterParticipants(list, { type: null, event: "ARTBO Feria" }).map((p) => p.id)).toEqual(["1", "3"]);
  });
  it("combines type and event", () => {
    expect(filterParticipants(list, { type: "Galería", event: "ARTBO Feria" }).map((p) => p.id)).toEqual(["1"]);
  });
});

describe("hasActiveFilters", () => {
  it("is false when both are null", () => expect(hasActiveFilters(NO_FILTERS)).toBe(false));
  it("is true when any is set", () => expect(hasActiveFilters({ type: "Galería", event: null })).toBe(true));
});

describe("buildParticipant", () => {
  it("trims text fields and attaches the id", () => {
    const p = buildParticipant({ ...base, fullName: "  Ana López ", type: "Galería", event: "ARTBO Feria" }, "p-9");
    expect(p.id).toBe("p-9");
    expect(p.fullName).toBe("Ana López");
  });
});

describe("getInitialsFromFullName", () => {
  it("uses first and last word, like getInitials", () => {
    expect(getInitialsFromFullName("Camila Andrea Rojas")).toBe("CR");
  });
  it("handles one word and blanks", () => {
    expect(getInitialsFromFullName("  sol ")).toBe("S");
    expect(getInitialsFromFullName("  ")).toBe("");
  });
});
