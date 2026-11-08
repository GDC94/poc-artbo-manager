import { describe, expect, it } from "vitest";
import { pickActiveSection } from "./active-section";

// Section tops are relative to the top of the visible scroll area (px).
const viewport = { clientHeight: 600, scrollHeight: 3000 };

describe("pickActiveSection", () => {
  it("returns the first section before any section reaches the line", () => {
    expect(pickActiveSection([300, 900, 1500], { ...viewport, scrollTop: 0 })).toBe(0);
  });

  it("picks the last section whose top crossed the activation line", () => {
    // Line sits at 20% of 600 = 120px while far from the end.
    expect(pickActiveSection([-400, 100, 700], { ...viewport, scrollTop: 800 })).toBe(1);
    expect(pickActiveSection([-400, 130, 700], { ...viewport, scrollTop: 800 })).toBe(0);
  });

  it("walks through short trailing sections during the last screen of scroll", () => {
    // Three short sections at the end, all below the 20% line.
    const tops = [-800, 200, 330, 460];
    const end = viewport.scrollHeight - viewport.clientHeight; // 2400

    // Halfway through the last screen the line is at 120 + 480 * 0.5 = 360.
    expect(pickActiveSection(tops, { ...viewport, scrollTop: end - 300 })).toBe(2);
    // At the very bottom the line reaches the bottom edge: the last section wins.
    expect(pickActiveSection(tops, { ...viewport, scrollTop: end })).toBe(3);
  });

  it("handles an empty list", () => {
    expect(pickActiveSection([], { ...viewport, scrollTop: 0 })).toBe(-1);
  });
});
