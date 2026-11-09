"use client";

import { useAdmin } from "@/lib/admin/store";
import type { Participant } from "@/lib/admin/types";
import { SEED_PARTICIPANTS } from "@/lib/mock/participants";
import { MOCK_USER } from "@/lib/mock/user";
import { splitFullName } from "@/lib/profile/names";

export type Viewer = {
  participantId: string;
  participant: Participant;
  firstName: string;
  lastName: string;
};

/**
 * The seeded admin record the participant side identifies as. For code that
 * cannot use hooks (provider defaults, module constants); throws when the seed
 * and `MOCK_USER.participantId` drift apart so the mismatch is loud, not silent.
 */
export function seedViewerParticipant(): Participant {
  const seeded = SEED_PARTICIPANTS.find((p) => p.id === MOCK_USER.participantId);
  if (!seeded) {
    throw new Error(`MOCK_USER.participantId "${MOCK_USER.participantId}" has no entry in SEED_PARTICIPANTS`);
  }
  return seeded;
}

/**
 * Who the participant area is rendering for. The admin participant list is the
 * source of truth for name, email and phone; `MOCK_USER.participantId` is the
 * only anchor. Falls back to the seed when admin renamed or deleted the record
 * so the greeting never crashes.
 */
export function useViewer(): Viewer {
  const { participants } = useAdmin();
  const participant = participants.find((p) => p.id === MOCK_USER.participantId) ?? seedViewerParticipant();
  const { firstName, lastName } = splitFullName(participant.fullName);
  return { participantId: MOCK_USER.participantId, participant, firstName, lastName };
}
