import { SEED_PARTICIPANTS, SEED_REQUIREMENTS, SEED_SELECTIONS } from "@/lib/mock/participants";

import { buildParticipant } from "./participants";
import {
  addRequirement,
  removeRequirementFromSelections,
  toggleRequirementActive,
  toggleSelection,
} from "./requirements";
import type { Participant, ParticipantInput, Requirement } from "./types";

export type AdminState = {
  participants: Participant[];
  requirements: Requirement[];
  /** participant id -> selected requirement ids. */
  selections: Record<string, string[]>;
  /** True once the persisted copy has been read (or failed to). */
  hydrated: boolean;
};

export type AdminAction =
  | { type: "hydrate"; data: Partial<Pick<AdminState, "participants" | "requirements" | "selections">> }
  | { type: "createParticipant"; id: string; input: ParticipantInput }
  | { type: "updateParticipant"; id: string; input: ParticipantInput }
  | { type: "addRequirement"; name: string }
  | { type: "toggleRequirement"; id: string }
  | { type: "removeRequirement"; id: string }
  | { type: "toggleSelection"; participantId: string; requirementId: string };

export function initialAdminState(): AdminState {
  return {
    participants: SEED_PARTICIPANTS,
    requirements: SEED_REQUIREMENTS,
    selections: SEED_SELECTIONS,
    hydrated: false,
  };
}

export function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case "hydrate":
      return { ...state, ...action.data, hydrated: true };
    case "createParticipant":
      return { ...state, participants: [...state.participants, buildParticipant(action.input, action.id)] };
    case "updateParticipant": {
      if (!state.participants.some((p) => p.id === action.id)) return state;
      return {
        ...state,
        participants: state.participants.map((p) =>
          p.id === action.id ? buildParticipant(action.input, action.id) : p,
        ),
      };
    }
    case "addRequirement": {
      const result = addRequirement(state.requirements, action.name);
      return result.ok ? { ...state, requirements: result.catalog } : state;
    }
    case "toggleRequirement":
      return { ...state, requirements: toggleRequirementActive(state.requirements, action.id) };
    case "removeRequirement": {
      if (!state.requirements.some((r) => r.id === action.id)) return state;
      return {
        ...state,
        requirements: state.requirements.filter((r) => r.id !== action.id),
        selections: removeRequirementFromSelections(state.selections, action.id),
      };
    }
    case "toggleSelection":
      return {
        ...state,
        selections: {
          ...state.selections,
          [action.participantId]: toggleSelection(
            state.selections[action.participantId] ?? [],
            action.requirementId,
          ),
        },
      };
  }
}
