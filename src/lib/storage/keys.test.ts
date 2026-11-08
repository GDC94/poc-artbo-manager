import { describe, expect, it } from "vitest";

import { ownerKey } from "./keys";

describe("ownerKey", () => {
  it("keeps the base key for the participant-side app (no owner)", () => {
    expect(ownerKey("artbo:brand:v1")).toBe("artbo:brand:v1");
    expect(ownerKey("artbo:brand:v1", undefined)).toBe("artbo:brand:v1");
  });
  it("scopes the key by owner id", () => {
    expect(ownerKey("artbo:files:v1", "p-01")).toBe("artbo:files:v1:p-01");
  });
});
