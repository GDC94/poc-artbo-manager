"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";

import { readLocal, writeLocal } from "@/lib/storage/local";

import { isParticipant } from "./participants";
import { isRequirement } from "./requirements";
import { adminReducer, initialAdminState, type AdminState } from "./state";
import type { Participant, ParticipantInput, Requirement } from "./types";

const PARTICIPANTS_KEY = "artbo:admin:participants:v1";
const REQUIREMENTS_KEY = "artbo:admin:requirements:v2";
const SELECTIONS_KEY = "artbo:admin:selections:v2";

const isArrayOf =
  <T,>(guard: (v: unknown) => v is T) =>
  (value: unknown): value is T[] =>
    Array.isArray(value) && value.every(guard);

function isSelections(value: unknown): value is Record<string, string[]> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  return Object.values(value).every((v) => Array.isArray(v) && v.every((id) => typeof id === "string"));
}

type Value = {
  participants: Participant[];
  requirements: Requirement[];
  selections: Record<string, string[]>;
  /** False until the stored copy was read; detail pages wait on it before reporting "not found". */
  ready: boolean;
  createParticipant: (input: ParticipantInput) => string;
  updateParticipant: (id: string, input: ParticipantInput) => void;
  addRequirement: (name: string) => void;
  toggleRequirement: (id: string) => void;
  removeRequirement: (id: string) => void;
  toggleSelection: (participantId: string, requirementId: string) => void;
};

const AdminContext = createContext<Value | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(adminReducer, undefined, initialAdminState);

  // Read after mount so server and first client render share the seed markup.
  useEffect(() => {
    const seed = initialAdminState();
    dispatch({
      type: "hydrate",
      data: {
        participants: readLocal(PARTICIPANTS_KEY, seed.participants, isArrayOf(isParticipant)),
        requirements: readLocal(REQUIREMENTS_KEY, seed.requirements, isArrayOf(isRequirement)),
        selections: readLocal(SELECTIONS_KEY, seed.selections, isSelections),
      },
    });
  }, []);

  // Never write before hydration: it would overwrite the stored copy with the seed.
  useEffect(() => {
    if (state.hydrated) writeLocal(PARTICIPANTS_KEY, state.participants);
  }, [state.participants, state.hydrated]);
  useEffect(() => {
    if (state.hydrated) writeLocal(REQUIREMENTS_KEY, state.requirements);
  }, [state.requirements, state.hydrated]);
  useEffect(() => {
    if (state.hydrated) writeLocal(SELECTIONS_KEY, state.selections);
  }, [state.selections, state.hydrated]);

  const createParticipant = useCallback((input: ParticipantInput) => {
    const id = `p-${crypto.randomUUID().slice(0, 8)}`;
    dispatch({ type: "createParticipant", id, input });
    return id;
  }, []);
  const updateParticipant = useCallback(
    (id: string, input: ParticipantInput) => dispatch({ type: "updateParticipant", id, input }),
    [],
  );
  const addRequirement = useCallback(
    (name: string) => dispatch({ type: "addRequirement", name }),
    [],
  );
  const toggleRequirement = useCallback((id: string) => dispatch({ type: "toggleRequirement", id }), []);
  const removeRequirement = useCallback((id: string) => dispatch({ type: "removeRequirement", id }), []);
  const toggleSelection = useCallback(
    (participantId: string, requirementId: string) =>
      dispatch({ type: "toggleSelection", participantId, requirementId }),
    [],
  );

  const value = useMemo<Value>(
    () => ({
      participants: state.participants,
      requirements: state.requirements,
      selections: state.selections,
      ready: state.hydrated,
      createParticipant,
      updateParticipant,
      addRequirement,
      toggleRequirement,
      removeRequirement,
      toggleSelection,
    }),
    [state, createParticipant, updateParticipant, addRequirement, toggleRequirement, removeRequirement, toggleSelection],
  );
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin(): Value {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside <AdminProvider>");
  return ctx;
}

export type { AdminState };
