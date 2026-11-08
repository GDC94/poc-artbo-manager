import { describe, expect, it } from "vitest";

import { EMPTY_FORM, validateParticipantForm, type ParticipantFormValues } from "./validation";

const valid: ParticipantFormValues = {
  ...EMPTY_FORM,
  fullName: "Ana López",
  type: "Galería",
  event: "ARTBO Feria",
  email: "ana@galeria.test",
  password: "clave-segura",
  confirmPassword: "clave-segura",
};

describe("validateParticipantForm", () => {
  it("passes a complete create form", () => {
    expect(validateParticipantForm(valid, "create")).toEqual({});
  });
  it("requires name and a well-formed email", () => {
    const errors = validateParticipantForm({ ...valid, fullName: " ", email: "nope" }, "create");
    expect(errors.fullName).toBeDefined();
    expect(errors.email).toBeDefined();
  });
  it("requires type and event", () => {
    const errors = validateParticipantForm({ ...valid, type: "", event: "" }, "create");
    expect(errors.type).toBeDefined();
    expect(errors.event).toBeDefined();
  });
  it("requires a password of 8+ chars on create", () => {
    expect(validateParticipantForm({ ...valid, password: "", confirmPassword: "" }, "create").password).toBeDefined();
    expect(validateParticipantForm({ ...valid, password: "corta", confirmPassword: "corta" }, "create").password).toBeDefined();
  });
  it("requires matching passwords on create", () => {
    expect(validateParticipantForm({ ...valid, confirmPassword: "otra-clave-1" }, "create").confirmPassword).toBeDefined();
  });
  it("allows empty passwords on edit", () => {
    const errors = validateParticipantForm({ ...valid, password: "", confirmPassword: "" }, "edit");
    expect(errors).toEqual({});
  });
  it("on edit, a filled password must match and be long enough", () => {
    expect(validateParticipantForm({ ...valid, password: "clave-segura", confirmPassword: "" }, "edit").confirmPassword).toBeDefined();
    expect(validateParticipantForm({ ...valid, password: "", confirmPassword: "clave-segura" }, "edit").password).toBeDefined();
    expect(validateParticipantForm({ ...valid, password: "corta", confirmPassword: "corta" }, "edit").password).toBeDefined();
  });
});
