"use client";

import { useEffect, useState, type ReactNode } from "react";

import { ArtboLoader } from "@/components/brand/artbo-loader";

/** Matches one full `artbo-loader-fill` sweep so the logo completes before the post appears. */
const LOADER_DURATION_MS = 1200;

/** Shows the ARTBO loader on entry, then reveals the post. */
export function ArticleReveal({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), LOADER_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (!ready) return <ArtboLoader />;
  return <div className="page-enter">{children}</div>;
}
