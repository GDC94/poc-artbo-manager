import { readLocal, writeLocal } from "@/lib/storage/local";

import type { Audience } from "./types";

export const readKey = (audience: Audience) => `artbo:notifications:read:v1:${audience}`;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((v) => typeof v === "string");

export function loadReadIds(audience: Audience): Set<string> {
  return new Set(readLocal(readKey(audience), [], isStringArray));
}

export function saveReadIds(audience: Audience, ids: ReadonlySet<string>): void {
  writeLocal(readKey(audience), [...ids]);
}
