export const PARTICIPANT_TYPES = ["Galería", "Institución", "Editorial", "Artista Artecámara"] as const;
export const PARTICIPANT_EVENTS = ["ARTBO Feria", "Fin de Semana ARTBO"] as const;

export type ParticipantType = (typeof PARTICIPANT_TYPES)[number];
export type ParticipantEvent = (typeof PARTICIPANT_EVENTS)[number];

export type Participant = {
  id: string;
  fullName: string;
  type: ParticipantType;
  event: ParticipantEvent;
  email: string;
  institution: string;
  phone: string;
  city: string;
  country: string;
};

/** What the create/edit form produces. Passwords are validated but never stored. */
export type ParticipantInput = Omit<Participant, "id">;

/**
 * A requirement in the global catalog. `active` decides whether the requirement is
 * offered in each participant's dropdown (see `requirements.ts`).
 */
export type Requirement = { id: string; label: string; active: boolean };

export type ParticipantFilters = {
  type: ParticipantType | null;
  event: ParticipantEvent | null;
};

export const NO_FILTERS: ParticipantFilters = { type: null, event: null };

export function isParticipantType(value: unknown): value is ParticipantType {
  return PARTICIPANT_TYPES.some((t) => t === value);
}

export function isParticipantEvent(value: unknown): value is ParticipantEvent {
  return PARTICIPANT_EVENTS.some((e) => e === value);
}

export function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
