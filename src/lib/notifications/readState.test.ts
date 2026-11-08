// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";

import { loadReadIds, readKey, saveReadIds } from "./readState";

describe("read state", () => {
  beforeEach(() => window.localStorage.clear());

  it("uses one versioned key per audience", () => {
    expect(readKey("admin")).toBe("artbo:notifications:read:v1:admin");
    expect(readKey("participant")).toBe("artbo:notifications:read:v1:participant");
  });

  it("round-trips a set of ids per audience", () => {
    saveReadIds("admin", new Set(["a", "b"]));
    expect([...loadReadIds("admin")].sort()).toEqual(["a", "b"]);
    expect(loadReadIds("participant").size).toBe(0);
  });

  it("falls back to empty on corrupt data", () => {
    window.localStorage.setItem(readKey("admin"), "{nope");
    expect(loadReadIds("admin").size).toBe(0);
    window.localStorage.setItem(readKey("admin"), JSON.stringify([1, 2]));
    expect(loadReadIds("admin").size).toBe(0);
  });
});
