import { describe, expect, it } from "vitest";

import { formatRelativeTime } from "./time";

const NOW = 10_000_000_000;
const ago = (ms: number) => formatRelativeTime(NOW - ms, NOW);

describe("formatRelativeTime", () => {
  it("says Ahora under a minute (and for future timestamps)", () => {
    expect(ago(30_000)).toBe("Ahora");
    expect(formatRelativeTime(NOW + 5000, NOW)).toBe("Ahora");
  });
  it("uses minutes, hours and days", () => {
    expect(ago(5 * 60_000)).toBe("Hace 5 min");
    expect(ago(2 * 3_600_000)).toBe("Hace 2 h");
    expect(ago(3 * 86_400_000)).toBe("Hace 3 d");
  });
});
