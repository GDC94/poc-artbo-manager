import { describe, expect, it } from "vitest";
import { getInitials } from "./initials";

describe("getInitials", () => {
  it("uses the first letter of first and last name, uppercased", () => {
    expect(getInitials("sebastián", "ramírez")).toBe("SR");
  });
  it("ignores surrounding whitespace", () => {
    expect(getInitials("  Ana ", " López")).toBe("AL");
  });
  it("falls back to a single initial when one name is missing", () => {
    expect(getInitials("Ana", "")).toBe("A");
    expect(getInitials("", "López")).toBe("L");
  });
  it("returns an empty string when both names are empty", () => {
    expect(getInitials(" ", "")).toBe("");
  });
});
