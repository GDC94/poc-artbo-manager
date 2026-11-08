import { describe, expect, it } from "vitest";

import { visibleChipCount } from "./overflow";

const base = { gap: 6, counterWidth: 24 };

describe("visibleChipCount", () => {
  it("returns every chip when all of them fit", () => {
    expect(visibleChipCount({ ...base, widths: [50, 50], available: 200 })).toBe(2);
  });

  it("keeps room for the counter when only some chips fit", () => {
    // 3 chips = 50*3 + 12 = 162 > 130. 2 chips + gap + counter = 106 + 6 + 24 = 136 > 130 -> 1.
    expect(visibleChipCount({ ...base, widths: [50, 50, 50], available: 130 })).toBe(1);
    // 2 chips + gap + counter = 136 <= 140 -> 2.
    expect(visibleChipCount({ ...base, widths: [50, 50, 50], available: 140 })).toBe(2);
  });

  it("accepts an exact fit and rejects one pixel less", () => {
    expect(visibleChipCount({ ...base, widths: [50, 50], available: 106 })).toBe(2);
    expect(visibleChipCount({ ...base, widths: [50, 50], available: 105 })).toBe(1);
  });

  it("never drops below one chip, even when it is too wide", () => {
    expect(visibleChipCount({ ...base, widths: [300, 50], available: 100 })).toBe(1);
    expect(visibleChipCount({ ...base, widths: [300], available: 100 })).toBe(1);
  });

  it("returns 0 for no chips", () => {
    expect(visibleChipCount({ ...base, widths: [], available: 100 })).toBe(0);
  });
});
