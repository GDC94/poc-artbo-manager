"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { MOCK_BRAND } from "@/lib/mock/user";
import { ownerKey } from "@/lib/storage/keys";
import { readLocal, writeLocal } from "@/lib/storage/local";

export type Brand = { name: string; description: string };

const BASE_KEY = "artbo:brand:v1";
const DEFAULT_BRAND: Brand = { ...MOCK_BRAND };

function isBrand(value: unknown): value is Brand {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.name === "string" && typeof v.description === "string";
}

type Value = {
  brand: Brand;
  ready: boolean;
  saveBrand: (next: Brand) => boolean;
};

const BrandContext = createContext<Value | null>(null);

type ProviderProps = {
  children: React.ReactNode;
  /**
   * Whose brand this is. Omitted for the participant-side app, which keeps the original
   * key; the admin passes a participant id to get an isolated copy (`artbo:brand:v1:<id>`).
   */
  ownerId?: string;
  /** Brand shown until something is saved. Defaults to the demo participant's brand. */
  defaultBrand?: Brand;
};

export function BrandProvider({ children, ownerId, defaultBrand = DEFAULT_BRAND }: ProviderProps) {
  const key = ownerKey(BASE_KEY, ownerId);
  const [brand, setBrand] = useState<Brand>(defaultBrand);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBrand(readLocal(key, defaultBrand, isBrand));
    setReady(true);
  }, [key, defaultBrand]);

  const saveBrand = useCallback(
    (next: Brand) => {
      setBrand(next);
      return writeLocal(key, next);
    },
    [key],
  );

  const value = useMemo(() => ({ brand, ready, saveBrand }), [brand, ready, saveBrand]);
  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}

export function useBrand(): Value {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error("useBrand must be used inside <BrandProvider>");
  return ctx;
}
