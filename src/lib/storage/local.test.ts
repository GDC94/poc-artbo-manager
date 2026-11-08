import { describe, expect, it } from "vitest";
import { parseStored } from "./local";

describe("parseStored", () => {
  const fallback = { name: "x" };
  const isValid = (v: unknown): v is { name: string } =>
    typeof v === "object" && v !== null && typeof (v as { name?: unknown }).name === "string";

  it("returns the parsed value when valid", () => {
    expect(parseStored('{"name":"Gymdoor"}', fallback, isValid)).toEqual({ name: "Gymdoor" });
  });
  it("falls back on null, bad JSON or wrong shape", () => {
    expect(parseStored(null, fallback, isValid)).toBe(fallback);
    expect(parseStored("{oops", fallback, isValid)).toBe(fallback);
    expect(parseStored("[1]", fallback, isValid)).toBe(fallback);
  });
});
