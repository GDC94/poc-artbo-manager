import { getInitials } from "@/lib/profile/initials";

import {
  hasText,
  isParticipantEvent,
  isParticipantType,
  type Participant,
  type ParticipantFilters,
  type ParticipantInput,
} from "./types";

export function filterParticipants(list: Participant[], filters: ParticipantFilters): Participant[] {
  return list.filter(
    (p) => (!filters.type || p.type === filters.type) && (!filters.event || p.event === filters.event),
  );
}

export function hasActiveFilters(filters: ParticipantFilters): boolean {
  return filters.type !== null || filters.event !== null;
}

export function buildParticipant(input: ParticipantInput, id: string): Participant {
  return {
    id,
    fullName: input.fullName.trim(),
    type: input.type,
    event: input.event,
    email: input.email.trim(),
    institution: input.institution.trim(),
    phone: input.phone.trim(),
    city: input.city.trim(),
    country: input.country.trim(),
  };
}

/** Same rule as `getInitials`, applied to the first and last word of a full name. */
export function getInitialsFromFullName(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  return getInitials(words[0], words.length > 1 ? words[words.length - 1] : "");
}

export function isParticipant(value: unknown): value is Participant {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    hasText(v.id) &&
    typeof v.fullName === "string" &&
    isParticipantType(v.type) &&
    isParticipantEvent(v.event) &&
    typeof v.email === "string" &&
    typeof v.institution === "string" &&
    typeof v.phone === "string" &&
    typeof v.city === "string" &&
    typeof v.country === "string"
  );
}
