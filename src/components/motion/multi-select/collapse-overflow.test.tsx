// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MultiSelect, MultiSelectTrigger, MultiSelectValue } from "./index";

const CHIP_WIDTH = 40;
const COUNTER_WIDTH = 24;

function stubLayout(rowWidth: number) {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(rowWidth);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
    this: HTMLElement,
  ) {
    const width = this.hasAttribute("data-measure-counter") ? COUNTER_WIDTH : CHIP_WIDTH;
    return { width, height: 24, top: 0, left: 0, right: width, bottom: 24, x: 0, y: 0 } as DOMRect;
  });
}

function renderSelect() {
  return render(
    <MultiSelect value={["alpha", "beta", "gamma", "delta"]} onValueChange={() => {}}>
      <MultiSelectTrigger singleLine>
        <MultiSelectValue collapseOverflow />
      </MultiSelectTrigger>
    </MultiSelect>,
  );
}

describe("MultiSelectValue collapseOverflow", () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("shows the chips that fit plus a +n counter naming the hidden labels", () => {
    stubLayout(130);
    renderSelect();

    expect(screen.getByRole("button", { name: "Remove alpha" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Remove beta" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Remove gamma" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Remove delta" })).toBeNull();

    const counter = screen.getByTitle("gamma, delta");
    expect(counter.textContent).toBe("+2");
    expect(counter.getAttribute("aria-label")).toBe("2 más: gamma, delta");
  });

  it("shows no counter when everything fits", () => {
    stubLayout(400);
    renderSelect();

    expect(screen.getAllByRole("button", { name: /^Remove / })).toHaveLength(4);
    expect(screen.queryByTitle(/gamma/)).toBeNull();
  });
});
