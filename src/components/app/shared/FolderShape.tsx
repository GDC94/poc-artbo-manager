"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { folderPath } from "@/components/app/shared/folderPath";

/**
 * Draws the folder outline behind its parent (the parent must be `relative
 * isolate`). The SVG measures the parent with a ResizeObserver and paints
 * nothing until it has a size. Colors come from the `--folder-fill` /
 * `--folder-stroke` custom properties the caller sets on the card. Optional
 * `--folder-stroke-width` (default 1) and `--folder-dash` (default solid, e.g.
 * `6 6`) let a card draw a dashed or thicker outline.
 */
export function FolderShape() {
  const ref = useRef<SVGSVGElement>(null);
  const [[w, h], setSize] = useState<[number, number]>([0, 0]);

  useLayoutEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const measure = () => setSize([parent.offsetWidth, parent.offsetHeight]);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      width={w}
      height={h}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-visible"
    >
      {w > 0 ? (
        <path
          d={folderPath(w, h)}
          fill="var(--folder-fill)"
          stroke="var(--folder-stroke)"
          style={{
            strokeWidth: "var(--folder-stroke-width, 1)",
            strokeDasharray: "var(--folder-dash, none)",
          }}
          className="transition-[fill,stroke] duration-200"
        />
      ) : null}
    </svg>
  );
}
