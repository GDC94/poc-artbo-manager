import { describe, expect, it } from "vitest";

import { splitFullName } from "./names";

describe("splitFullName", () => {
  it("takes the first token as firstName and the rest as lastName", () => {
    expect(splitFullName("Valentina Ospina Duarte")).toEqual({ firstName: "Valentina", lastName: "Ospina Duarte" });
  });
  it("leaves lastName empty for a single token", () => {
    expect(splitFullName("Admin")).toEqual({ firstName: "Admin", lastName: "" });
  });
  it("collapses extra inner and outer whitespace", () => {
    expect(splitFullName("  Valentina   Ospina \t Duarte  ")).toEqual({
      firstName: "Valentina",
      lastName: "Ospina Duarte",
    });
  });
  it("yields empty strings for an empty or blank name", () => {
    expect(splitFullName("")).toEqual({ firstName: "", lastName: "" });
    expect(splitFullName("   ")).toEqual({ firstName: "", lastName: "" });
  });
});
