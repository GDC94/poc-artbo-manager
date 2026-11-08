"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import { ArtboLogo } from "@/components/brand/artbo-logo";

const noopSubscribe = () => () => {};

/**
 * ARTBO wordmark that fills left-to-right over a dimmed copy of itself, centered on the viewport.
 * Portaled to `body`: the route wrapper animates `transform`, which would otherwise make
 * `position: fixed` resolve against that wrapper instead of the viewport.
 */
export function ArtboLoader() {
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false);
  if (!isClient) return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
    >
      <span className="sr-only">Cargando…</span>
      <div aria-hidden className="relative w-[140px]">
        <ArtboLogo className="block h-auto w-full opacity-15" />
        <ArtboLogo className="artbo-loader-fill absolute inset-0 block h-auto w-full" />
      </div>
    </div>,
    document.body,
  );
}
