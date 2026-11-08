import { describe, expect, it } from "vitest";

import { adminReducer, initialAdminState } from "./state";
import type { ParticipantInput } from "./types";

const input: ParticipantInput = {
  fullName: "Nuevo Participante",
  type: "Editorial",
  event: "ARTBO Feria",
  email: "nuevo@x.test",
  institution: "Editorial Nueva",
  phone: "",
  city: "Cali",
  country: "Colombia",
};

describe("adminReducer", () => {
  it("creates a participant at the end of the list", () => {
    const s0 = initialAdminState();
    const s1 = adminReducer(s0, { type: "createParticipant", id: "p-new", input });
    expect(s1.participants.at(-1)?.id).toBe("p-new");
    expect(s1.participants).toHaveLength(s0.participants.length + 1);
  });

  it("updates only the targeted participant", () => {
    const s0 = initialAdminState();
    const target = s0.participants[0];
    const s1 = adminReducer(s0, { type: "updateParticipant", id: target.id, input: { ...input, phone: "1" } });
    expect(s1.participants[0]).toMatchObject({ id: target.id, fullName: "Nuevo Participante", phone: "1" });
    expect(s1.participants[1]).toEqual(s0.participants[1]);
  });

  it("ignores updates for unknown ids", () => {
    const s0 = initialAdminState();
    expect(adminReducer(s0, { type: "updateParticipant", id: "zzz", input })).toBe(s0);
  });

  it("adds a valid requirement and rejects duplicates", () => {
    const s0 = initialAdminState();
    const s1 = adminReducer(s0, { type: "addRequirement", name: "Contratos legales" });
    expect(s1.requirements.at(-1)).toEqual({ id: "contratos-legales", label: "Contratos legales", active: true });
    const s2 = adminReducer(s1, { type: "addRequirement", name: "contratos LEGALES" });
    expect(s2).toBe(s1);
  });

  it("toggles requirement activity", () => {
    const s0 = initialAdminState();
    const id = s0.requirements[0].id;
    const s1 = adminReducer(s0, { type: "toggleRequirement", id });
    expect(s1.requirements[0].active).toBe(!s0.requirements[0].active);
  });

  it("removes a requirement from the catalog and from every participant's selection", () => {
    const s0 = adminReducer(initialAdminState(), {
      type: "hydrate",
      data: {
        requirements: [
          { id: "r1", label: "Uno", active: true },
          { id: "r2", label: "Dos", active: false },
        ],
        selections: { a: ["r1", "r2"], b: ["r1"], c: ["r2"] },
      },
    });
    const s1 = adminReducer(s0, { type: "removeRequirement", id: "r1" });
    expect(s1.requirements.map((r) => r.id)).toEqual(["r2"]);
    expect(s1.selections).toEqual({ a: ["r2"], b: [], c: ["r2"] });
  });

  it("ignores removal of an unknown requirement", () => {
    const s0 = initialAdminState();
    expect(adminReducer(s0, { type: "removeRequirement", id: "zzz" })).toBe(s0);
  });

  it("toggles a selection per participant", () => {
    const s0 = adminReducer(initialAdminState(), { type: "hydrate", data: { selections: {} } });
    const s1 = adminReducer(s0, { type: "toggleSelection", participantId: "a", requirementId: "r1" });
    expect(s1.selections.a).toEqual(["r1"]);
    const s2 = adminReducer(s1, { type: "toggleSelection", participantId: "a", requirementId: "r1" });
    expect(s2.selections.a).toEqual([]);
  });

  it("hydrate merges provided slices and flags hydrated", () => {
    const s = adminReducer(initialAdminState(), { type: "hydrate", data: { participants: [] } });
    expect(s.participants).toEqual([]);
    expect(s.hydrated).toBe(true);
    expect(s.requirements.length).toBeGreaterThan(0);
  });
});
