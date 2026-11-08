import { SEED_PARTICIPANTS } from "@/lib/mock/participants";
import { readLocal } from "@/lib/storage/local";

import { isParticipant } from "./participants";
import type { Participant } from "./types";

export const PARTICIPANTS_KEY = "artbo:admin:participants:v1";

export const isArrayOf =
  <T,>(guard: (v: unknown) => v is T) =>
  (value: unknown): value is T[] =>
    Array.isArray(value) && value.every(guard);

/** The participant list as the admin store would hydrate it, for readers outside the provider. */
export function readStoredParticipants(): Participant[] {
  return readLocal(PARTICIPANTS_KEY, SEED_PARTICIPANTS, isArrayOf(isParticipant));
}
